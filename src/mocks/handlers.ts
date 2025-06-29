import { ApiError } from '@/@types/api'
import { http, HttpResponse } from 'msw'

export const handlers = [
    http.get('/api/v1/error', () => {
        return new HttpResponse<ApiError>(
            {
                message: '서버 내부 오류가 발생했습니다.',
                code: 'INTERNAL_SERVER_ERROR',
                status: 500,
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        )
    }),
]
