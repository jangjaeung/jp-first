import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as styles from './devtool.module.scss'

const ReactDevTool = () => {
    if (process.env.isHot) {
        return (
            <div className={styles.devtool}>
                <ReactQueryDevtools initialIsOpen={false} />
            </div>
        )
    }
    return <></>
}

export default ReactDevTool
