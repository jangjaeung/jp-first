import { useMemo } from 'react'

const useYAxis = ({
    data,
    chartHeight,
    yTicks,
    paddingRatio,
}: {
    data: { value: number }[]
    chartHeight: number
    yTicks: number
    paddingRatio: number
}) => {
    const allValues = data.map(d => d.value)
    const maxVal = Math.max(...allValues, 0)
    const minVal = Math.min(...allValues, 0)
    const scaledMaxVal = maxVal + (maxVal - minVal) * paddingRatio
    const safeScaledMaxVal = scaledMaxVal === 0 ? 1 : scaledMaxVal

    const yScales = useMemo(() => Array.from({ length: yTicks + 1 }, (_, i) => Math.round((scaledMaxVal / yTicks) * i)), [scaledMaxVal, yTicks])

    const getY = (val: number) => {
        if (!safeScaledMaxVal) return chartHeight
        const y = chartHeight - (val / safeScaledMaxVal) * chartHeight
        return isNaN(y) ? chartHeight : y
    }

    return { yScales, getY }
}

export default useYAxis
