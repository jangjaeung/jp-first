import { memo } from 'react'
import { ButtonIcon } from './buttonIcon'
import './styles.scss'
import { ButtonProp } from './types'

const Button = ({ children, value, iconType, ...rest }: ButtonProp) => {
    return (
        <button {...rest}>
            {iconType && ButtonIcon(iconType)}
            {children}
            {value && <p>{value}</p>}
        </button>
    )
}

export default memo(Button)
