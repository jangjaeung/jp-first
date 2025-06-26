import classNames from 'classnames'
import { forwardRef } from 'react'
import Input from '../input'
import './styles'
import { InputBoxProps } from './types'

/**
 * @description Input 내부에 무언가를 추가할때 사용하는 컴포넌트
 * @param ...input
 * @param wrapperClass string[] div에 줄 클래스
 * @param children el
 */
const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(({ type = 'text', wrapperClass, children, classList, ...rest }, ref) => {
    return (
        <div className={classNames('input-box', wrapperClass)}>
            <Input type={type} className={classNames(classList)} ref={ref} {...rest} />
            {children && children}
        </div>
    )
})

export default InputBox
