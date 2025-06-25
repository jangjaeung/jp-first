import { ComponentType, lazy } from 'react'

interface ComponentModule<T> {
    default: ComponentType<T>
}

type ImportComponent<T> = () => Promise<ComponentModule<T>>

function retryLazy<T>(componentImport: () => Promise<{ default: ComponentType<T> }>): Promise<{
    default: ComponentType<T>
}> {
    return new Promise((resolve, reject) => {
        componentImport()
            .then(component => {
                resolve(component)
            })
            .catch(error => {
                if (error?.message && /Loading chunk/.test(error.message)) {
                    return window.location.reload()
                } else {
                    reject(error)
                }
            })
    })
}

const _lazy = <T = unknown>(componentImport: ImportComponent<T>) => lazy<ComponentType<T>>(() => retryLazy<T>(componentImport))

export default _lazy
