import { useEffect, useState } from 'react'

/**
 *
 * @param targetRef 감지할 element ref
 * @descriptions 현재 페이지가 노출되어 있나 판별하는 hook
 */
export const useObserver = <T extends HTMLElement = HTMLElement>(targetRef: React.MutableRefObject<T | null>) => {
    const [visible, setVisible] = useState<boolean>(false)

    useEffect(() => {
        const options = {
            rootMargin: '0px',
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                setVisible(entry.isIntersecting)
            })
        }, options)

        if (targetRef.current) {
            observer.observe(targetRef.current)
        }

        return () => {
            if (observer) {
                observer.disconnect()
            }
        }
    }, [])

    return { visible, setVisible }
}
