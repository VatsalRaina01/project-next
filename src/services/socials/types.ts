import type { socialFieldsToExpose } from './constants'
import type { socialOwnerSchema } from './schemas'
import type { Social } from '@/prisma-generated-pn-types'
import type { z } from 'zod'

export type SocialFiltered = Pick<Social, typeof socialFieldsToExpose[number]>

export type SocialOwner = z.infer<typeof socialOwnerSchema>
