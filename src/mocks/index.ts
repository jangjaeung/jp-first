import type { StartOptions } from 'msw/browser'

interface MSWConfig {
    enabled: boolean
    options?: StartOptions
}

const mswConfig: MSWConfig = {
    enabled: process.env.NODE_ENV === 'development' && process.env.MSW_MODE === 'true',
    options: {
        onUnhandledRequest: 'bypass',
        serviceWorker: {
            url: '/mockServiceWorker.js',
        },
    },
}

async function enableMocking(): Promise<void> {
    if (!mswConfig.enabled) {
        console.log('MSW is disabled')
        return
    }

    try {
        const { worker } = await import('./browser')

        // MSW 워커 시작
        await worker.start(mswConfig.options)

        console.log('MSW is enabled and running')
    } catch (error) {
        console.error('Failed to start MSW:', error)
    }
}

export default enableMocking
