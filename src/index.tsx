import '@assets/styles/common.scss'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import enableMocking from './mocks'

// MSW 초기화 후 React 앱 시작
const startApp = async (): Promise<void> => {
    await enableMocking()

    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
}

startApp().catch(console.error)
