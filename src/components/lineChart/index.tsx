import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { POINT_WIDTH } from './const'
import './styles'

export type DataPoint = { key: string; label: string; value: number; color: string }

interface ILineChart {
    data: DataPoint[]
    chartHeight?: number
    yTicks?: number
    yAxisWidth?: number
    paddingRatio?: number
    customTooltip?: (data: DataPoint) => React.ReactNode
    tickFormatter?: (data: DataPoint, idx: number, arr?: DataPoint[]) => string
    isScroll?: boolean
    pointWidth?: number
}
/**
 *
 * @param data 같은 key를 기준으로 라인 생성
 * @param chartHeight 세로 크기
 * @param yTicks  Y축 틱 갯수
 * @param yAxisWidth 이 값이 커지면 Y축 라벨이 넓게 보이고, 작아지면 라벨이 차트와 더 가까워짐
 * @param paddingRatio 최상단 마진 비율
 * @param customTooltip 마우스 호버시 노출할 툴팁 (default: data.value)
 * @param tickFormatter x축 라벨 커스텀 (default: data.label)
 * @param isScroll 스크롤 사용 여부(ture: 가로스크롤 생성 스크롤 추적기능 on default false)
 * @param pointWidth 틱과 틱 사이의 간격(default: 60)
 */
const LineChart = ({
    data,
    chartHeight = 200,
    yTicks = 5,
    yAxisWidth = 40,
    paddingRatio = 0.2,
    customTooltip,
    tickFormatter,
    isScroll = false,
    pointWidth = POINT_WIDTH,
}: ILineChart) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [containerWidth, setContainerWidth] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const [tooltipSizes, setTooltipSizes] = useState<{ [key: string]: { width: number; height: number } }>({})
    const tooltipRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const [scrollLeft, setScrollLeft] = useState(0)
    const [isUserScrolling, setIsUserScrolling] = useState(false)

    const [maxVal, minVal] = useMemo(() => [Math.max(...data.map(d => d.value), 0), Math.min(...data.map(d => d.value), 0)], [data])
    const scaledMaxVal = useMemo(() => maxVal + (maxVal - minVal) * paddingRatio, [maxVal, minVal])
    const yScales = useMemo(() => Array.from({ length: yTicks + 1 }, (_, i) => Math.round((scaledMaxVal / yTicks) * i)), [scaledMaxVal, yTicks])

    // scaledMaxVal이 0이면 1로 대체(0으로 나누기 방지)
    const safeScaledMaxVal = scaledMaxVal === 0 ? 1 : scaledMaxVal

    // 같은 key 별로 묶기
    const groupedData = useMemo(() => {
        const groups: { [key: string]: DataPoint[] } = {}
        data.forEach(point => {
            if (!groups[point.key]) {
                groups[point.key] = []
            }
            groups[point.key].push(point)
        })
        return groups
    }, [data])

    useLayoutEffect(() => {
        // customTooltip이 있는 경우만 측정
        if (!customTooltip) return
        const newSizes: { [key: string]: { width: number; height: number } } = {}
        Object.entries(tooltipRefs.current).forEach(([k, ref]) => {
            if (ref) newSizes[k] = { width: ref.offsetWidth, height: ref.offsetHeight }
        })
        setTooltipSizes(newSizes)
    }, [groupedData, customTooltip, hoveredIndex])

    useEffect(() => {
        if (!containerRef.current) return

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width)
            }
        })

        resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
    }, [])

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
            const svgRect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - svgRect.left
            const idx = Math.round((x - yAxisWidth) / pointWidth)
            if (idx >= 0 && idx < data.length) {
                const px = yAxisWidth + idx * pointWidth
                if (Math.abs(px - x) <= 20) {
                    setHoveredIndex(idx)
                } else {
                    setHoveredIndex(null)
                }
            } else {
                setHoveredIndex(null)
            }
        },
        [data.length, pointWidth, yAxisWidth],
    )

    const handleMouseLeave = useCallback(() => {
        setHoveredIndex(null)
    }, [])

    // 스크롤 핸들러: isScroll이 true일 때만 동작
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!isScroll) return
        setScrollLeft(e.currentTarget.scrollLeft)
        if (e.currentTarget.scrollWidth - e.currentTarget.clientWidth - e.currentTarget.scrollLeft > 2) {
            setIsUserScrolling(true)
        } else {
            setIsUserScrolling(false)
        }
    }

    // 데이터가 추가될 때 자동 스크롤: isScroll이 false면 항상 최신 데이터에 포커싱
    useEffect(() => {
        if (!containerRef.current) return
        if (isScroll) {
            if (!isUserScrolling) {
                containerRef.current.scrollLeft = containerRef.current.scrollWidth - containerRef.current.clientWidth
            }
        } else {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth - containerRef.current.clientWidth
        }
    }, [data.length, isUserScrolling, isScroll])

    // 가상화 범위 계산: isScroll이 false면 항상 최신 데이터만 보이게
    const virtualWidth = Math.max(data.length * pointWidth, containerWidth)
    let startIndex = Math.max(0, Math.floor(scrollLeft / pointWidth) - 1)
    let endIndex = Math.min(data.length, Math.ceil((scrollLeft + containerWidth) / pointWidth) + 1)
    if (!isScroll) {
        // 최신 데이터가 항상 보이도록
        endIndex = data.length
        startIndex = Math.max(0, endIndex - Math.ceil(containerWidth / pointWidth) - 1)
    }
    const visibleData = data.slice(startIndex, endIndex)

    // y값 계산할 때 NaN 방지
    const getY = (val: number) => {
        if (!safeScaledMaxVal) return chartHeight
        const y = chartHeight - (val / safeScaledMaxVal) * chartHeight
        return isNaN(y) ? chartHeight : y
    }

    const lineAreaWidth = Math.max(0, virtualWidth - yAxisWidth)

    return (
        <div
            id="lineChart"
            style={{
                height: chartHeight + 40,
            }}
        >
            {/* Y축 라벨: 고정 */}
            <div
                className="label-y"
                style={{
                    width: yAxisWidth,
                    height: chartHeight + 10,
                }}
            >
                {yScales.map((val, idx) => {
                    const y = getY(val)
                    return (
                        <div
                            key={idx}
                            style={{
                                top: y - 10,
                            }}
                        >
                            {val}
                        </div>
                    )
                })}
            </div>

            {/* 차트 영역: 가로 스크롤 */}
            <div
                ref={containerRef}
                style={{
                    overflowX: isScroll ? 'auto' : 'hidden',
                    height: chartHeight + 40,
                }}
                onScroll={handleScroll}
                className="chart-area"
            >
                <div style={{ width: virtualWidth }}>
                    {/* 가로 눈금선 */}
                    <svg className="line-x" width={lineAreaWidth} height={chartHeight} style={{ left: yAxisWidth }}>
                        {yScales.map((val, i) => {
                            const y = getY(val)
                            return <line key={i} x1={0} y1={y} x2={lineAreaWidth} y2={y} stroke="#ccc" strokeDasharray="4 2" />
                        })}
                        <line x1={0} y1={chartHeight} x2={lineAreaWidth} y2={chartHeight} stroke="#333" strokeWidth={1} />
                    </svg>

                    {/* 선 + 포인트 (가상화) */}
                    <svg
                        width={virtualWidth}
                        height={chartHeight + 40}
                        style={{ position: 'absolute', top: 0, left: 0, zIndex: 3 }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* 세로선(hover line) */}
                        {hoveredIndex !== null && hoveredIndex >= startIndex && hoveredIndex < endIndex && (
                            <line
                                x1={yAxisWidth + hoveredIndex * pointWidth}
                                y1={0}
                                x2={yAxisWidth + hoveredIndex * pointWidth}
                                y2={chartHeight}
                                stroke="#E2E2E9"
                                strokeDasharray="3 2"
                                style={{ zIndex: 10 }}
                            />
                        )}
                        {Object.entries(groupedData).map(([key, dataPoints]) => {
                            const points = visibleData.map((d, i) => {
                                const globalIdx = startIndex + i
                                const x = yAxisWidth + globalIdx * pointWidth
                                const y = getY(d.value)
                                return { x, y, globalIdx }
                            })
                            return (
                                <g key={key}>
                                    <polyline
                                        fill="none"
                                        stroke={dataPoints[0].color}
                                        strokeWidth="2"
                                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                                    />
                                    {points.map((p, i) => {
                                        const tooltipKey = `${key}_${i}`
                                        const tooltipWidth = customTooltip ? (tooltipSizes[tooltipKey]?.width ?? 60) : 60
                                        const tooltipHeight = customTooltip ? (tooltipSizes[tooltipKey]?.height ?? 30) : 30
                                        // x 위치 계산
                                        let x = p.x - tooltipWidth / 2
                                        if (p.x < 50) x = p.x
                                        else if (i === points.length - 1) x = p.x - tooltipWidth
                                        else if (p.x > containerWidth - 50) x = p.x - tooltipWidth
                                        // y 위치 계산
                                        const aboveY = p.y - tooltipHeight - 8
                                        const belowY = p.y + 8
                                        let y = aboveY < 0 ? Math.min(belowY, chartHeight - tooltipHeight) : aboveY

                                        return (
                                            <g key={i}>
                                                {hoveredIndex === p.globalIdx && (
                                                    <foreignObject x={x} y={y} width={tooltipWidth} height={tooltipHeight}>
                                                        {customTooltip ? (
                                                            <div
                                                                ref={el => {
                                                                    tooltipRefs.current[tooltipKey] = el
                                                                }}
                                                                style={{ display: 'inline-block' }}
                                                            >
                                                                {customTooltip(data[startIndex + i])}
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="data-label"
                                                                style={{
                                                                    color: dataPoints[0].color,
                                                                }}
                                                            >
                                                                <p style={{ margin: 0 }}>{data[startIndex + i].value}</p>
                                                            </div>
                                                        )}
                                                    </foreignObject>
                                                )}
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={3}
                                                    fill={dataPoints[0].color}
                                                    stroke={dataPoints[0].color}
                                                    strokeWidth={1}
                                                />
                                            </g>
                                        )
                                    })}
                                </g>
                            )
                        })}
                    </svg>

                    {/* X축 라벨 (가상화) */}
                    <div
                        className="label-x"
                        style={{
                            left: yAxisWidth,
                            width: virtualWidth - yAxisWidth,
                        }}
                    >
                        {visibleData.map((d, i) => {
                            const globalIdx = startIndex + i
                            return (
                                <div
                                    key={globalIdx}
                                    style={{
                                        width: pointWidth,
                                        left: globalIdx * pointWidth,
                                    }}
                                >
                                    {tickFormatter ? tickFormatter(d, globalIdx, data) : d.label}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LineChart
