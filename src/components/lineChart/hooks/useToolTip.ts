import { useLayoutEffect, useRef, useState } from 'react'
import { DataPoint } from '../index'

interface UseTooltipProps {
    customTooltip?: (data: DataPoint) => React.ReactNode
    customAllToolTip?: (data: DataPoint[]) => React.ReactNode
    groupedData: { [key: string]: { [label: string]: DataPoint } }
    hovered: { key: string; idx: number } | null
    labels: string[]
    getY: (value: number) => number
    chartHeight: number
    yAxisWidth: number
    pointWidth: number
    containerWidth: number
}

const useTooltip = ({
    customTooltip,
    customAllToolTip,
    groupedData,
    hovered,
    labels,
    getY,
    chartHeight,
    yAxisWidth,
    pointWidth,
    containerWidth,
}: UseTooltipProps) => {
    // customTooltip 관련
    const [tooltipSizes, setTooltipSizes] = useState<{ [key: string]: { width: number; height: number } }>({})
    const tooltipRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

    useLayoutEffect(() => {
        if (!customTooltip) return
        const newSizes: { [key: string]: { width: number; height: number } } = {}
        Object.entries(tooltipRefs.current).forEach(([k, ref]) => {
            if (ref) newSizes[k] = { width: ref.offsetWidth, height: ref.offsetHeight }
        })
        setTooltipSizes(newSizes)
    }, [groupedData, customTooltip, hovered])

    // customAllToolTip 관련
    const [allTooltipSize, setAllTooltipSize] = useState<{ width: number; height: number }>({ width: 120, height: 40 })
    const customAllTooltipRef = useRef<HTMLDivElement | null>(null)

    useLayoutEffect(() => {
        if (!customAllToolTip || !hovered) return
        if (customAllTooltipRef.current) {
            setAllTooltipSize({
                width: customAllTooltipRef.current.offsetWidth,
                height: customAllTooltipRef.current.offsetHeight,
            })
        }
    }, [customAllToolTip, hovered])

    // customAllToolTip 렌더링에 필요한 정보만 반환
    const getCustomAllTooltipProps = () => {
        if (!customAllToolTip || !hovered) return null
        const label = labels[hovered.idx]
        const allData = Object.values(groupedData)
            .map(labelMap => labelMap[label])
            .filter(Boolean) as DataPoint[]
        if (!allData.length) return null

        // 가운데(y값이 중간) dot 찾기
        const sorted = [...allData].sort((a, b) => getY(a.value) - getY(b.value))
        const midIdx = Math.floor(sorted.length / 2)
        const midData = sorted[midIdx]

        const globalIdx = hovered.idx
        const x = yAxisWidth + globalIdx * pointWidth
        const y = getY(midData.value)
        const tooltipWidth = allTooltipSize.width
        const tooltipHeight = allTooltipSize.height

        // x, y 위치 조정
        let fx = x - tooltipWidth / 2
        if (x < 50) fx = x
        else if (x > containerWidth - 50) fx = x - tooltipWidth
        let fy = y - tooltipHeight - 8
        if (fy < 0) fy = Math.min(y + 8, chartHeight - tooltipHeight)

        return {
            x: fx,
            y: fy,
            width: tooltipWidth,
            height: tooltipHeight,
            ref: customAllTooltipRef,
            allData,
        }
    }

    return {
        tooltipSizes,
        tooltipRefs,
        getCustomAllTooltipProps,
    }
}

export default useTooltip
