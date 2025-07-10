// src/components/lineChart/hooks/useContainerResize.ts
import { RefObject, useEffect, useState } from 'react'

const useContainerResize = (containerRef: RefObject<HTMLElement>) => {
    const [containerWidth, setContainerWidth] = useState(0)

    useEffect(() => {
        if (!containerRef.current) return
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width)
            }
        })
        resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
    }, [containerRef])

    return containerWidth
}

export default useContainerResize
