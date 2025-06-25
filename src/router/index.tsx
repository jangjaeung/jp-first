import Loading from '@/components/loading'
import ReactDevTool from '@/components/reactDevTool/devtool'
import { Suspense } from 'react'
import { BrowserRouter, Routes } from 'react-router-dom'

const Router = () => {
    return (
        <Suspense fallback={<Loading />}>
            <ReactDevTool />
            <BrowserRouter>
                <Routes>
                </Routes>
            </BrowserRouter>
        </Suspense>
    )
}

export default Router
