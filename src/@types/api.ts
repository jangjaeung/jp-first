// API 응답 타입
export interface ApiResponse<T> {
    data: T
    message?: string
    success: boolean
}

// 에러 타입
export interface ApiError {
    message: string
    code: string
    status: number
}
