'use server'
import { releaseCountdownOperations } from './operations'
import { makeAction } from '@/services/serverAction'

export const unlockReleaseCountdownAction = makeAction(releaseCountdownOperations.unlock)
