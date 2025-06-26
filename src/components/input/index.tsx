import { emptyConvert, numberFormat } from '@/utils/common'
import classNames from 'classnames'
import { forwardRef, memo, useCallback } from 'react'
import './styles.scss'
import { InputHTMLAttributesValue, InputProps } from './types'

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ type = 'text', placeholder, value, onKeyUp, onKeyDown, disabled, classList, ...rest }, ref) => {
        const convertValue = useCallback((value: InputHTMLAttributesValue) => {
            switch (typeof value) {
                case 'string':
                    return emptyConvert(value)
                case 'number':
                    return emptyConvert(numberFormat(value))
                default:
                    return value ? value : '-'
            }
        }, [])

        return (
            <input
                ref={ref}
                type={type}
                key={`input_${rest.id}`}
                placeholder={placeholder}
                className={classNames(classList)}
                value={disabled ? convertValue(value) : value}
                onKeyUp={e => e.key === 'Enter' && onKeyUp && onKeyUp(e)}
                disabled={disabled}
                onKeyDown={e => onKeyDown && onKeyDown(e)}
                {...rest}
            />
        )
    },
)

Input.displayName = 'Input'

export default memo(Input)
