import Loading from '@/components/loading'
import ReactDevTool from '@/components/reactDevTool/devtool'
import { layoutComp } from '@/pages'
import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const Router = () => {
    return (
        <Suspense fallback={<Loading />}>
            <ReactDevTool />
            <BrowserRouter>
                <Routes>
                    <Route path={'/'} element={<layoutComp.home />} />
                </Routes>
            </BrowserRouter>
        </Suspense>
    )
}

export default Router
