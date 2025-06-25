import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RecoilRoot } from 'recoil'
import Router from './router'

const App = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                retryOnMount: false,
                refetchOnWindowFocus: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                placeholderData: (previousData: any) => previousData,
            },
        },
    })

    return (
        <RecoilRoot>
            <QueryClientProvider client={queryClient}>
                <Router />
            </QueryClientProvider>
        </RecoilRoot>
    )
}

export default App
