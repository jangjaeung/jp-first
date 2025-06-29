// MSW 관련 타입 정의
declare module 'msw/browser' {
    export * from 'msw'
}

declare module 'msw/node' {
    export * from 'msw'
}

// 환경변수 타입 정의
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MSW_MODE?: string
            NODE_ENV: 'development' | 'production' | 'test'
        }
    }
}

export {}
