import type { ApiError, ApiResponse } from '@/@types/api'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API 클라이언트 설정
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: '/api/v1',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    // 요청 인터셉터
    client.interceptors.request.use(
        config => {
            return config
        },
        error => {
            return Promise.reject(error)
        },
    )

    // 응답 인터셉터
    client.interceptors.response.use(
        (response: AxiosResponse) => {
            return response
        },
        error => {
            // 에러 처리
            if (error.response?.data) {
                const apiError: ApiError = error.response.data
                console.error('API Error:', apiError)
            }
            return Promise.reject(error)
        },
    )

    return client
}

export const apiClient = createApiClient()

export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) => apiClient.get<ApiResponse<T>>(url, config).then(res => res.data),

    post: <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig) =>
        apiClient.post<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(url, data, config).then(res => res.data),

    put: <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig) =>
        apiClient.put<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(url, data, config).then(res => res.data),

    delete: <T>(url: string, config?: AxiosRequestConfig) => apiClient.delete<ApiResponse<T>>(url, config).then(res => res.data),
}
