import { authAuth } from './auth'
import { authSchemas } from './schemas'
import { moveFeideAccountToUser } from './feideAccounts/move'
import { userFilterSelection } from '@/services/users/constants'
import { userSchemas } from '@/services/users/schemas'
import { sendResetPasswordMail } from '@/lib/email/systemMail/resetPassword'
import { sendLinkFeideAccountMail } from '@/lib/email/systemMail/linkFeideAccount'
import { defineOperation } from '@/services/serviceOperation'
import { ServerError } from '@/services/error'
import { userOperations } from '@/services/users/operations'
import { readJWTPayload } from '@/lib/jwt/jwtReadUnsecure'
import logger from '@/lib/logger'
import { z } from 'zod'

export const authOperations = {
    verifyEmail: defineOperation({
        paramsSchema: z.object({
            token: z.string(),
        }),
        authorizer: ({ params }) => authAuth.verifyEmail.dynamicFields(params),
        operation: async ({ prisma, params }) => {
            // INFO: Safe to parse unsafe since the authorizer has verified the token.
            const payload = readJWTPayload(params.token)

            if (!payload.sub || !payload.email || !payload.iat) {
                throw new ServerError('JWT INVALID', 'The JWT does not contain the mandatory fields')
            }

            const userId = Number(payload.sub)
            const email = String(payload.email)

            const iat = new Date(payload.iat * 1000)

            const user = await userOperations.read({
                params: {
                    id: userId,
                },
                bypassAuth: true,
            })

            if (iat < user.updatedAt) {
                throw new ServerError('JWT INVALID', 'The user has changed since the token was generated.')
            }

            return await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    emailVerified: new Date(),
                    email,
                },
                select: userFilterSelection,
            })
        }
    }),

    verifyResetPasswordToken: defineOperation({
        paramsSchema: z.object({
            token: z.string()
        }),
        authorizer: ({ params }) => authAuth.resetPassword.dynamicFields(params),
        operation: async ({ prisma, params }) => {
            // INFO: Safe to parse unsafe since the authorizer has verified the token.
            const payload = readJWTPayload(params.token)

            if (!payload.sub || !payload.iat) {
                throw new ServerError('JWT INVALID', 'The forgot password JWT is not valid')
            }

            const userId = Number(payload.sub)

            const user = await prisma.user.findUniqueOrThrow({
                where: {
                    id: userId,
                },
                select: {
                    credentials: true
                }
            })

            if (user.credentials && user.credentials?.credentialsUpdatedAt > new Date(payload.iat * 1000)) {
                throw new ServerError('JWT INVALID', 'The password has already been changed')
            }

            return userId
        }
    }),

    resetPassword: defineOperation({
        paramsSchema: z.object({
            token: z.string()
        }),
        dataSchema: userSchemas.updatePassword,
        authorizer: ({ params }) => authAuth.resetPassword.dynamicFields(params),
        operation: async ({ params, data }) => {
            const userId = await authOperations.verifyResetPasswordToken({ params })

            userOperations.updatePassword({
                params: {
                    id: userId,
                },
                data,
                bypassAuth: true,
            })
        }
    }),

    sendLinkFeideAccountEmail: defineOperation({
        dataSchema: authSchemas.sendLinkFeideAccountEmail,
        authorizer: () => authAuth.sendLinkFeideAccountEmail.dynamicFields({}),
        operation: async ({ prisma, data, session }) => {
            if (!session.user) {
                throw new ServerError('DISSALLOWED', 'This endpoint requires a user connected to the session.')
            }

            // Only a fresh Feide login that has not completed registration may ask to be
            // moved onto a migrated user - a registered user asking would end with that
            // user being deleted by the move.
            const feideUser = await prisma.user.findUniqueOrThrow({
                where: { id: session.user.id },
                select: {
                    id: true,
                    acceptedTerms: true,
                    credentials: { select: { userId: true } },
                    feideAccount: { select: { id: true } },
                },
            })

            if (!feideUser.feideAccount || feideUser.credentials || feideUser.acceptedTerms) {
                throw new ServerError(
                    'DISSALLOWED',
                    'Bare en ny Feide-innlogging som ikke har fullført registreringen kan kobles til en gammel bruker.'
                )
            }

            const usernameOrEmail = data.usernameOrEmail.trim().toLowerCase()

            // The response is the same whether the user was found or not, so this endpoint
            // cannot be used to probe which users exist or are still unclaimed.
            const targetUser = await prisma.user.findFirst({
                where: {
                    OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
                    feideAccount: null,
                    credentials: null,
                    NOT: { id: feideUser.id },
                },
                select: userFilterSelection,
            })

            if (targetUser) {
                try {
                    await sendLinkFeideAccountMail(targetUser, feideUser.id)
                } catch (err) {
                    logger.error(`Failed to send link feide account mail to user '${targetUser.username}'`, { error: err })
                }
            }

            return data.usernameOrEmail
        }
    }),

    linkFeideAccount: defineOperation({
        paramsSchema: z.object({
            token: z.string(),
        }),
        authorizer: ({ params }) => authAuth.linkFeideAccount.dynamicFields(params),
        opensTransaction: true,
        operation: async ({ prisma, params }) => {
            // INFO: Safe to parse unsafe since the authorizer has verified the token.
            const payload = readJWTPayload(params.token)

            if (!payload.sub || !payload.feideUserId) {
                throw new ServerError('JWT INVALID', 'The JWT does not contain the mandatory fields')
            }

            await moveFeideAccountToUser(prisma, {
                fromUserId: Number(payload.feideUserId),
                toUserId: Number(payload.sub),
            })
        }
    }),

    adminLinkFeideAccount: defineOperation({
        dataSchema: authSchemas.adminLinkFeideAccount,
        authorizer: () => authAuth.adminLinkFeideAccount.dynamicFields({}),
        opensTransaction: true,
        operation: async ({ prisma, data }) => {
            const fromUser = await prisma.user.findUniqueOrThrow({
                where: { username: data.fromUsername.trim().toLowerCase() },
                select: { id: true },
            })
            const toUser = await prisma.user.findUniqueOrThrow({
                where: { username: data.toUsername.trim().toLowerCase() },
                select: { id: true },
            })

            await moveFeideAccountToUser(prisma, {
                fromUserId: fromUser.id,
                toUserId: toUser.id,
            })
        }
    }),

    sendResetPasswordEmail: defineOperation({
        dataSchema: authSchemas.sendResetPasswordEmail,
        authorizer: () => authAuth.sendResetPasswordEmail.dynamicFields({}),
        operation: async ({ data }) => {
            try {
                const user = await userOperations.read({
                    params: {
                        email: data.email,
                    },
                    bypassAuth: true,
                })

                sendResetPasswordMail(user.email)
            } catch (err) {
                logger.error(`Failed to send reset password to email '${data.email}'`, { error: err })
                return data.email
            }

            return data.email
        }
    }),
}
