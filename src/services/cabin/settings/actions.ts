'use server'

import { cabinSettingsOperations } from './operations'
import { makeAction } from '@/services/serverAction'

export const readCabinSettingsAction = makeAction(cabinSettingsOperations.read)
export const updateCabinSettingsAction = makeAction(cabinSettingsOperations.update)
