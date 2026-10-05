'use client'

import { createContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserBasic } from '@/services/users/types'

type PropTypes = {
    children: ReactNode
}

/**
 * Context designed to be used with UserPagingContext and UserList.
 * If UserList is rendered inside IserSelectionProvider, it will display a checkbox next to each user.
 */
export const UsersSelectionContext = createContext<{
    users: UserBasic[]
    addUser: (user: UserBasic) => void
    removeUser: (user: UserBasic) => void
    toggle: (user: UserBasic) => void
    includes: (user: UserBasic) => boolean
        } | null>(null)

export default function UsesrSelectionProvider({ children }: PropTypes) {
    const [users, setUsers] = useState<UserBasic[]>([])

    const addUser = (user: UserBasic) => {
        setUsers([...users, user])
    }
    const removeUser = (user: UserBasic) => {
        setUsers(users.filter(userItem => userItem !== user))
    }
    const toggle = (user: UserBasic) => {
        if (users.includes(user)) {
            removeUser(user)
        } else {
            addUser(user)
        }
    }

    const includes = (user: UserBasic) => users.includes(user)

    return <UsersSelectionContext.Provider value={{ users, addUser, removeUser, toggle, includes }}>
        {children}
    </UsersSelectionContext.Provider>
}
