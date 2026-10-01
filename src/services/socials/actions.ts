'use server'
import { socialOperations } from './operations'
import { makeAction } from '@/services/serverAction'

export const readSocialsAction = makeAction(socialOperations.readSocials)
export const upsertSocialAction = makeAction(socialOperations.upsertSocial)
export const destroySocialAction = makeAction(socialOperations.destroySocial)
