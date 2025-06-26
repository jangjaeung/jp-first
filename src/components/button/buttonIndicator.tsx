import { PropsWithChildren } from 'react'
import * as styles from './buttonIndicator.module.scss'

const ButtonIndicator = ({ isLoading, children }: PropsWithChildren<{ isLoading: boolean }>) => {
    if (isLoading) {
        return (
            <div className={styles.container}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
            </div>
        )
    }
    return children
}

export default ButtonIndicator
