import classNames from 'classnames'
import { memo } from 'react'
import { ChildrenProps } from '../types'
import './styles'

const ButtonArea = ({ children, classList = [] }: ChildrenProps) => {
    return (
        <div onClick={e => e.stopPropagation()} className={classNames(['btn-wrap', ...classList])}>
            {children}
        </div>
    )
}

export default memo(ButtonArea)
