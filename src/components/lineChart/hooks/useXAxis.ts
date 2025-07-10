interface UseXAxisProps {
    pointWidth: number
    containerWidth: number
    scrollLeft: number
    isScroll: boolean
    labels: string[]
}

const useXAxis = ({ pointWidth, containerWidth, scrollLeft, isScroll, labels }: UseXAxisProps) => {
    // 가상화 계산
    const virtualWidth = Math.max(labels.length * pointWidth, containerWidth)
    let startIndex = Math.max(0, Math.floor(scrollLeft / pointWidth) - 1)
    let endIndex = Math.min(labels.length, Math.ceil((scrollLeft + containerWidth) / pointWidth) + 1)
    if (!isScroll) {
        endIndex = labels.length
        startIndex = Math.max(0, endIndex - Math.ceil(containerWidth / pointWidth) - 1)
    }
    const visibleLabels = labels.slice(startIndex, endIndex)

    return {
        labels,
        virtualWidth,
        startIndex,
        endIndex,
        visibleLabels,
    }
}

export default useXAxis
