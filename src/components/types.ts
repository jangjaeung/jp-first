import { ReactNode } from 'react'

export interface ChildrenProps {
    children?: ReactNode
    classList?: string[]
}

export type DynamicKey<T> = {
    [key: string]: T
}
