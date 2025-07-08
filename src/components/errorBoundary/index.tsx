import ErrorIconTriangle from '@images/error_icon_triangle.svg?react'
import { Component, ReactNode } from 'react'
import './styles'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-wrapper">
                    <ErrorIconTriangle />
                    <p>정상 처리되지 않았습니다</p>
                    <p>관리자에게 문의해 주세요</p>
                </div>
            )
        }
        return this.props.children
    }
}

export default ErrorBoundary
