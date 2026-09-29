import '@pn-server-only'
import { admissionSchemas } from './schemas'
import { admissionAuth } from './auth'
import { userFilterSelection } from '@/services/users/constants'
import { defineOperation } from '@/services/serviceOperation'
import { ServerError } from '@/services/error'
import { omegaMembershipGroupOperations } from '@/services/groups/omegaMembershipGroups/operations'
import { Admission } from '@/prisma-generated-pn-types'
import { z } from 'zod'
import type { ExpandedAdmissionTrail } from './types'

export const admissionOperations = {
    readTrial: defineOperation({
        paramsSchema: admissionSchemas.readTrial,
        authorizer: ({ params }) => admissionAuth.readTrial.dynamicFields({ userId: params.userId }),
        operation: async ({ prisma, params: { userId } }) => await prisma.admissionTrial.findMany({
            where: {
                userId,
            }
        })
    }),

    /**
     * Whether the user has sat every admission trial there is, which is what earns them their place
     * as a sysken. A user holds at most one trial per admission, so counting them is enough.
     */
    userCompletedTrials: defineOperation({
        paramsSchema: admissionSchemas.userCompletedTrials,
        authorizer: ({ params }) => admissionAuth.userCompletedTrials.dynamicFields({ userId: params.userId }),
        operation: async ({ prisma, params: { userId } }): Promise<boolean> => {
            const trials = await prisma.admissionTrial.count({
                where: {
                    userId,
                }
            })
            return trials >= Object.keys(Admission).length
        }
    }),
    /**
     * Registers that the user has sat the given trial, and makes them a sysken once that was the
     * last one they had left.
     *
     * Only a soelle sits trials: den gemene hob has not been let in to start their admission, and a
     * sysken has already finished it. Anyone else is therefore turned away rather than quietly
     * given a trial that would never add up to anything.
     */
    createTrial: defineOperation({
        authorizer: () => admissionAuth.createTrial.dynamicFields({}),
        paramsSchema: z.object({
            admission: z.nativeEnum(Admission),
        }),
        dataSchema: admissionSchemas.createTrial,
        operation: async ({ prisma, session, params, data }): Promise<ExpandedAdmissionTrail> => {
            const omegaMembership = await omegaMembershipGroupOperations.readUserLevel({
                params: {
                    userId: data.userId
                },
                bypassAuth: true,
            })

            if (omegaMembership.level !== 'SOELLE') {
                throw new ServerError(
                    'BAD PARAMETERS',
                    'Opptaksprøver kan kun registreres for en soelle.'
                )
            }

            const results = await prisma.admissionTrial.create({
                data: {
                    user: {
                        connect: {
                            id: data.userId,
                        },
                    },
                    registeredBy: {
                        connect: {
                            id: session.user?.id,
                        },
                    },
                    admission: params.admission,
                },
                include: {
                    user: {
                        select: userFilterSelection,
                    }
                }
            })

            const completedTrials = await admissionOperations.userCompletedTrials({
                params: {
                    userId: data.userId
                },
                bypassAuth: true,
            })

            if (completedTrials) {
                await omegaMembershipGroupOperations.updateUserLevel({
                    params: {
                        userId: data.userId,
                        omegaMembershipLevel: 'SYSKEN',
                        onlyUpgrade: true,
                    },
                    bypassAuth: true,
                })
            }

            return results
        }
    }),
}
