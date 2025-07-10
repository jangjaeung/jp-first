// src/components/lineChart/hooks/useScroll.ts
import { RefObject, useCallback, useEffect, useState } from 'react'

const useScroll = (containerRef: RefObject<HTMLDivElement>, isScroll: boolean, labelsLength: number) => {
    const [scrollLeft, setScrollLeft] = useState(0)
    const [isUserScrolling, setIsUserScrolling] = useState(false)

    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            if (!isScroll) return
            setScrollLeft(e.currentTarget.scrollLeft)
            if (e.currentTarget.scrollWidth - e.currentTarget.clientWidth - e.currentTarget.scrollLeft > 2) {
                setIsUserScrolling(true)
            } else {
                setIsUserScrolling(false)
            }
        },
        [isScroll],
    )

    // 데이터 추가시 자동 스크롤
    useEffect(() => {
        if (!containerRef.current) return
        if (isScroll) {
            if (!isUserScrolling) {
                containerRef.current.scrollLeft = containerRef.current.scrollWidth - containerRef.current.clientWidth
            }
        } else {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth - containerRef.current.clientWidth
        }
    }, [labelsLength, isUserScrolling, isScroll, containerRef])

    return { scrollLeft, handleScroll }
}

export default useScroll
