/**
 * URL QueryParam 변환 함수
 * @param url base url
 * @param object query string object
 */
export const urlQueryStringify = ({ url, queryParams }: { url: string; queryParams: object }) => {
    if (queryParams) {
        const keyValue = Object.entries(queryParams)?.reduce((acc: string[], cur) => {
            const [key, value = ''] = cur
            if (value) {
                const strType = typeof value === 'string'
                acc.push(`${key}=${strType ? value.trim() : value}`)
            }
            return acc
        }, [])

        return `${url}?${keyValue.join('&')}`
    }
    return url
}

/** Parameter 조합 */
export const mixPath = (pathParam: (string | number)[]) => pathParam.join('/')


/** 값이 없을 경우 하이픈 리턴 */
export const emptyConvert = (value?: string | number | null | undefined, type = '-') => {
    return value || type
}

/** 3자리마다 콤마 적용 */
export const numberFormat = (value?: number) => value?.toLocaleString()

/** 문구 복사 */
export const onCopy = (str: string) => navigator.clipboard.writeText(str)


/**
 * 값이 없는지 체크하는 함수.
 * 숫자 0은 값이 있는 것으로 간주합니다.
 *
 * @param value - 체크할 값
 * @returns 값이 없으면 true, 값이 있으면 false
 */
export function isEmpty(value: any): boolean {
    // null이나 undefined는 값이 없는 것으로 간주
    if (value === null || value === undefined) {
        return true
    }

    // 숫자 0은 값이 있는 것으로 간주
    if (typeof value === 'number') {
        return false
    }

    if (typeof value === 'string' && value.trim() === '') {
        return true
    }

    if (Array.isArray(value) && value.length === 0) {
        return true
    }

    // Date 객체가 유효하지 않은 날짜인 경우 값이 없는 것으로 간주
    if (value instanceof Date) {
        return isNaN(value.getTime())
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
        return true
    }

    return false
}

