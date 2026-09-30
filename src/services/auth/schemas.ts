import { userSchema } from '@/services/users/schemas'
import { z } from 'zod'

export const authSchemas = {
    sendResetPasswordEmail: userSchema.pick({
        email: true,
    }),
    sendLinkFeideAccountEmail: z.object({
        usernameOrEmail: z.string().min(1),
    }),
    adminLinkFeideAccount: z.object({
        fromUsername: z.string().min(1),
        toUsername: z.string().min(1),
    }),
}
