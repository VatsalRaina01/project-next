import { LedgerAccountType } from '@/prisma-generated-pn/enums'
import { Zpn } from '@/lib/fields/zpn'
import { z } from 'zod'

const ledgerAcccountSchema = z.object({
    type: z.nativeEnum(LedgerAccountType),
    // Display name for the account. Only meaningful for GROUP accounts (see LedgerAccount.name).
    name: z.string().optional(),
    userId: z.number().optional(),
    groupIds: Zpn.numberListCheckboxFriendly({ label: 'Grupper' }).optional(),
    payoutAccountNumber: z.string().optional(),
    frozen: z.boolean(),
})

export const ledgerAccountSchemas = {
    create: ledgerAcccountSchema.partial().pick({
        type: true,
        name: true,
        userId: true,
        groupIds: true,
        payoutAccountNumber: true,
        frozen: true,
    }).superRefine(({ type, userId, groupIds }, ctx) => {
        if (type === undefined && userId === undefined && groupIds === undefined) {
            ctx.addIssue({
                code: 'custom',
                message: 'Kontotype må være oppgitt dersom verken gruppe ID eller bruker ID er oppgitt.',
                path: ['type'],
            })
        }

        if (type === 'GROUP' && userId !== undefined) {
            ctx.addIssue({
                code: 'custom',
                message: 'Gruppe kontoer kan ikke opprettes med en bruker ID.',
                path: ['userId'],
            })
        }

        if (type === 'USER' && groupIds !== undefined) {
            ctx.addIssue({
                code: 'custom',
                message: 'Bruker kontoer kan ikke opprettes med gruppe ID-er.',
                path: ['groupIds'],
            })
        }
    }),

    update: ledgerAcccountSchema.partial().pick({
        name: true,
        payoutAccountNumber: true,
        userId: true,
        groupIds: true,
        frozen: true,
    })
}
