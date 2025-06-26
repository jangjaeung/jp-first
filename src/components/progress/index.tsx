import cx from 'classnames';
import './styles';

const STATUS_CLASSNAME: Record<string, string> = {
    R: 'wating',
    I: 'ongoing',
    S: 'success',
    F: 'fail',
    C: 'cancel',
}
const Progress = ({ status, percent }: { status: keyof typeof STATUS_CLASSNAME; percent: number }) => {
    return (
        <div className="progress-wrapper">
            <div className="progress">
                <div className={cx('progress-bar', status)} style={{ width: `${percent}%` }} />
            </div>
        </div>
    )
}

export default Progress
