import { z } from 'zod'

export const cabinSettingsSchemas = {
    update: z.object({
        ledgerAccountId: z.number().nullable(),
    }),
}
