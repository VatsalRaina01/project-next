import { isBuildPhase } from '@/lib/isBuildPhase'
import { ServiceError } from '@/services/error'


export const NTNUEmailDomain = 'stud.ntnu.no'

export const validMailAdressDomains = isBuildPhase() ? ['omega.ntnu.no'] : (() => {
    if (!process.env.DOMAIN || !process.env.MAIL_DOMAIN) {
        throw new ServiceError('INVALID CONFIGURATION', 'The environment variables DOMAIN and MAIL_DOMAIN must be set')
    }
    return [
        process.env.DOMAIN,
        process.env.MAIL_DOMAIN
    ] as const
})()
