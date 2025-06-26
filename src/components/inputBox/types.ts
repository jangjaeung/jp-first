import { InputProps } from '../input/types'

export interface InputBoxOwnProps {
    wrapperClass?: string[]
    children?: React.ReactNode
}

export type InputBoxProps = InputBoxOwnProps & Omit<InputProps, keyof InputBoxOwnProps>
