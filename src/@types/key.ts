/**
 * 객체 타입 T에서 특정 타입 V와 호환되는 속성의 키들만 추출하는 유틸리티 타입입니다.
 *
 * @template T - 키를 추출할 대상 객체 타입
 * @template V - 필터링할 값의 타입
 *
 * @example
 * // User 인터페이스에서 string 타입을 가진 속성의 키만 추출
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   isAdmin: boolean;
 * }
 *
 * type StringKeys = ExtractTypeKeys<User, string>; // 'name' | 'email'
 *
 * @returns 타입 V와 호환되는 T의 속성 키들로 구성된 유니온 타입
 */

export type ExtractTypeKeys<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/**
 * 객체 타입 T의 모든 속성을 null 유니온 타입으로 변환하는 유틸리티 타입입니다.
 *
 * @template T - 변환할 객체 타입
 *
 * @example
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   isAdmin: boolean;
 * }
 *
 * type NullableUser = Nullable<User>; // { id: number | null, name: string | null, email: string | null, isAdmin: boolean | null }
 */
export type Nullable<T> = {
    [P in keyof T]: T[P] | null
}
