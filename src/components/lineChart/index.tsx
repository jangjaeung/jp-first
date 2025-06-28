import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CHART_WIDTH_PADDING } from './const'
import './styles'

type Point = { x: number; y: number }
export type DataPoint = { key: string; label: string; value: number; color: string }

interface ILineChart {
    data: DataPoint[]
    chartHeight?: number
    yTicks?: number
    yAxisWidth?: number
    paddingRatio?: number
    customTooltip?: (data: DataPoint) => React.ReactNode
    tickFormatter?: (data: DataPoint, idx: number, arr?: DataPoint[]) => string
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
 */
const LineChart = ({ data, chartHeight = 200, yTicks = 5, yAxisWidth = 40, paddingRatio = 0.2, customTooltip, tickFormatter }: ILineChart) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [containerWidth, setContainerWidth] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const [tooltipSizes, setTooltipSizes] = useState<{ [key: string]: { width: number; height: number } }>({})
    const tooltipRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

    const [maxVal, minVal] = useMemo(() => [Math.max(...data.map(d => d.value), 0), Math.min(...data.map(d => d.value), 0)], [data])
    const scaledMaxVal = useMemo(() => maxVal + (maxVal - minVal) * paddingRatio, [maxVal, minVal])
    const yScales = useMemo(() => Array.from({ length: yTicks + 1 }, (_, i) => Math.round((scaledMaxVal / yTicks) * i)), [scaledMaxVal, yTicks])

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

    const linePoints = useMemo(() => {
        // 컨테이너 마운트 전 예외 처리
        if (containerWidth === 0 || !data.length) return {}

        // Y축 너비를 제외한 실제 차트가 그려질 수 있는 가용 너비 계산
        const availableWidth = containerWidth - yAxisWidth
        const totalWidth = availableWidth

        // 차트 시작/종료 지점이 너무 붙어있지 않게 패딩 값 적용
        const padding = totalWidth * CHART_WIDTH_PADDING

        // 데이터 포인트가 1개일 때는 중앙에 표시
        const segmentWidth = Object.values(groupedData)[0].length === 1 ? 0 : (totalWidth - padding * 2) / (Object.values(groupedData)[0].length - 1)

        const result: { [key: string]: { x: number; y: number }[] } = {}
        Object.entries(groupedData).forEach(([key, dataPoints]) => {
            result[key] = dataPoints.map((d, i) => {
                // 데이터 포인트가 1개일 때는 중앙에 표시
                const x = dataPoints.length === 1 ? yAxisWidth + totalWidth / 2 : i * segmentWidth + yAxisWidth + padding
                const y = chartHeight - (d.value / scaledMaxVal) * chartHeight
                return { x, y }
            })
        })
        return result
    }, [data, scaledMaxVal, yAxisWidth, chartHeight, containerWidth, groupedData])

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
            const svgRect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - svgRect.left

            let closest = 0
            let closestDistance = Infinity
            Object.entries(linePoints).forEach(([key, points]) => {
                points.forEach((p, i) => {
                    const dist = Math.abs(p.x - x)
                    if (dist < closestDistance) {
                        closestDistance = dist
                        closest = i
                    }
                })
            })

            // 마우스 위치가 포인트 양옆 20px 안에 들어오면 라벨 노출
            if (closestDistance <= 20) {
                setHoveredIndex(closest)
            } else {
                setHoveredIndex(null)
            }
        },
        [linePoints],
    )

    const handleMouseLeave = useCallback(() => {
        setHoveredIndex(null)
    }, [])

    // 툴팁 x 좌표 계산 함수
    const getTooltipX = useCallback(
        (p: Point, i: number, points: Point[], key: string): number => {
            const valueWidth = String(groupedData[key][i].value).length * 8 + 16
            if (p.x < 50) return p.x
            if (i === points.length - 1) return p.x - valueWidth
            if (p.x > containerWidth - 50) return p.x - 60
            return p.x - 30
        },
        [groupedData, containerWidth],
    )

    return (
        <div
            id="lineChart"
            ref={containerRef}
            style={{
                height: chartHeight + 40,
            }}
        >
            {/* y축 눈금 라벨 */}
            <div
                className="label-y"
                style={{
                    width: yAxisWidth,
                    height: chartHeight + 10,
                }}
            >
                {yScales.map((val, idx) => (
                    <div key={idx} style={{ lineHeight: '1em' }}>
                        {val}
                    </div>
                ))}
            </div>

            {/* 가로 눈금선 */}
            <svg className="line-x" width={Math.max(0, containerWidth - (yAxisWidth + 10))} height={chartHeight}>
                {yScales.map((val, i) => {
                    const y = chartHeight - (val / scaledMaxVal) * chartHeight
                    return y >= 0 && <line key={i} x1={0} y1={y} x2={containerWidth - yAxisWidth} y2={y} stroke="#ccc" strokeDasharray="4 2" />
                })}
                <line x1={0} y1={chartHeight} x2={containerWidth - yAxisWidth} y2={chartHeight} stroke="#333" strokeWidth={1} />
            </svg>

            {/* 선 + 마우스 인터랙션 */}
            <svg
                width={containerWidth}
                height={chartHeight + 40}
                style={{ position: 'absolute', top: 0, left: 0 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {Object.entries(linePoints)?.map(([key, points]) => (
                    <g key={key}>
                        <polyline
                            fill="none"
                            stroke={groupedData[key][0].color}
                            strokeWidth="2"
                            points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        />
                        {/* 세로선 */}
                        {hoveredIndex !== null && (
                            <line
                                x1={points[hoveredIndex].x}
                                y1={0}
                                x2={points[hoveredIndex].x}
                                y2={chartHeight}
                                stroke="#E2E2E9"
                                strokeDasharray="3 2"
                            />
                        )}

                        {/* 포인트 및 값 */}
                        {points.map((p, i) => (
                            <g key={i}>
                                {hoveredIndex === i && (
                                    <foreignObject
                                        x={getTooltipX(p, i, points, key)}
                                        y={(() => {
                                            const tooltipHeight = customTooltip ? (tooltipSizes[`${key}_${i}`]?.height ?? 30) : 30
                                            // 1. dot 위에 툴팁을 띄우는 y좌표
                                            const aboveY = p.y - tooltipHeight - 8
                                            // 2. dot 아래에 툴팁을 띄우는 y좌표
                                            const belowY = p.y + 8
                                            // 3. 위에 띄웠을 때 0보다 작으면(즉, 위로 나가면) 아래에 띄움, 아니면 위에 띄움
                                            if (aboveY < 0) {
                                                // 아래에 띄우되, 차트 하단 넘지 않게
                                                return Math.min(belowY, chartHeight - tooltipHeight)
                                            }
                                            return aboveY
                                        })()}
                                        width={
                                            customTooltip
                                                ? (tooltipSizes[`${key}_${i}`]?.width ?? 60) + 'px'
                                                : String(groupedData[key][i].value).length * 8 + 16 + 'px'
                                        }
                                        height={customTooltip ? (tooltipSizes[`${key}_${i}`]?.height ?? 30) : 30}
                                    >
                                        {customTooltip ? (
                                            <div
                                                ref={el => {
                                                    tooltipRefs.current[`${key}_${i}`] = el
                                                }}
                                                style={{ display: 'inline-block' }}
                                            >
                                                {customTooltip(groupedData[key][i])}
                                            </div>
                                        ) : (
                                            <div
                                                className="data-label"
                                                style={{
                                                    color: groupedData[key][i].color,
                                                }}
                                            >
                                                <p style={{ margin: 0 }}>{groupedData[key][i].value}</p>
                                            </div>
                                        )}
                                    </foreignObject>
                                )}
                                <circle cx={p.x} cy={p.y} r={3} fill={groupedData[key][0].color} stroke={groupedData[key][0].color} strokeWidth={1} />
                            </g>
                        ))}
                    </g>
                ))}
            </svg>

            {/* X축 라벨 */}
            <div
                className="label-x"
                style={{
                    left: yAxisWidth,
                    width: Math.max(0, containerWidth - yAxisWidth),
                    userSelect: 'none',
                }}
            >
                {Object.values(groupedData)[0]?.map((d, i, arr) => {
                    const padding = (containerWidth - yAxisWidth) * CHART_WIDTH_PADDING
                    const segmentWidth =
                        Object.values(groupedData)[0].length === 1
                            ? 0
                            : (containerWidth - yAxisWidth - padding * 2) / (Object.values(groupedData)[0].length - 1)
                    const x = Object.values(groupedData)[0].length === 1 ? (containerWidth - yAxisWidth) / 2 : i * segmentWidth + padding
                    return (
                        <div
                            key={i}
                            style={{
                                left: `${x}px`,
                            }}
                        >
                            {tickFormatter ? tickFormatter(d, i, arr) : d.label}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default LineChart
