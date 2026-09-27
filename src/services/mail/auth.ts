import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequireEveryPermission } from '@/auth/authorizer/RequireEveryPermission'

export const mailAuth = {
    createAliasMailingListRelation: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    createMailingListExternalRelation: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    createMailingListUserRelation: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    createMailingListGroupRelation: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    destroyAliasMailingListRelation: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    destroyMailingListExternalRelation: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    destroyMailingListUserRelation: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    destroyMailingListGroupRelation: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    readMailFlow: RequireEveryPermission.staticFields({
        permissions: ['MAILINGLIST_USE', 'MAILALIAS_USE', 'MAILADDRESS_EXTERNAL_USE']
    }),
    readMailOptions: RequireEveryPermission.staticFields({
        permissions: ['MAILINGLIST_USE', 'MAILALIAS_USE', 'MAILADDRESS_EXTERNAL_USE']
    }),
} as const
