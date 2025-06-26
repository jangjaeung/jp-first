export type InputHTMLAttributesValue = string | ReadonlyArray<string> | number | undefined

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    classList?: string[]
}
