import { isEmpty } from '@/utils/common'

/**
 * 객체가 비어 있거나 빈 값을 가진 속성이 있는지 확인합니다.
 *
 * @param {Record<string, any>} obj - 검사할 객체.
 * @returns {boolean} 객채 속성중 빈값을 포함하는지 여부
 */
export const hasObjectEmptyValues = (obj: Record<string, any>) => {
    const objectArray = Object.values(obj)

    if (objectArray.length === 0) return true
    return objectArray.some(value => isEmpty(value))
}

/**
 *
 * 두 객체 중 특정 key값의 value가 같은지 검사
 */
export const objectEqual = <T extends Record<string, any>>(a: T, b: T, keys: (keyof T)[]): boolean => {
    return keys.every(key => a[key] === b[key])
}
