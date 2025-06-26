import { ButtonHTMLAttributes } from 'react'

export interface ButtonProp extends ButtonHTMLAttributes<HTMLButtonElement> {
    classNames?: string[]
    value?: string
    iconType?: string
}
