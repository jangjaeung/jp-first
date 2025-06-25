/**
 * 값이 없을경우 하이픈 리턴
 * @param sentence
 * @param returnType
 */
export const convertBlankHyphen = (sentence?: any, returnType: string = '-') => {
    if (typeof sentence === 'string') {
        return sentence || returnType
    } else {
        return sentence ?? returnType
    }
}
