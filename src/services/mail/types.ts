
import type { Group, MailAddressExternal, MailAlias, MailingList } from '@/prisma-generated-pn-types'
import type { UserBasic } from '@/services/users/types'


export const MailListTypeArray = ['alias', 'mailingList', 'group', 'user', 'mailaddressExternal'] as const
export type MailListTypes = typeof MailListTypeArray[number];

export type ViaType = {
    type: MailListTypes,
    id: number,
    label: string,
}

export type ViaArrayType = {
    via?: ViaType[],
}

export type MailFlowObject = {
    alias: MailAlias[] & ViaArrayType,
    mailingList: MailingList[] & ViaArrayType,
    group: Group[] & ViaArrayType,
    user: UserBasic[] & ViaArrayType,
    mailaddressExternal: MailAddressExternal[] & ViaArrayType,
}
