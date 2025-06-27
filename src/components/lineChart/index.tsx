import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CHART_WIDTH_PADDING, PADDING_RATIO } from './const'
import './styles'

type Point = { x: number; y: number }
export type DataPoint = { key: string; label: string; value: number; color: string }

interface ILineChart {
    data: DataPoint[]
    chartHeight?: number
    yTicks?: number
    yAxisWidth?: number
}
/**
 *
 * @param data 같은 key를 기준으로 라인 생성
 * @param chartHeight 세로 크기
 * @param yTicks  Y축 틱 갯수
 * @param yAxisWidth 이 값이 커지면 Y축 라벨이 넓게 보이고, 작아지면 라벨이 차트와 더 가까워짐
 */
const LineChart = ({ data, chartHeight = 200, yTicks = 5, yAxisWidth = 40 }: ILineChart) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [containerWidth, setContainerWidth] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const [maxVal, minVal] = useMemo(() => [Math.max(...data.map(d => d.value), 0), Math.min(...data.map(d => d.value), 0)], [data])
    const scaledMaxVal = useMemo(() => maxVal + (maxVal - minVal) * PADDING_RATIO, [maxVal, minVal])
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
            <svg width={containerWidth} height={chartHeight + 40} style={{ position: 'absolute', top: 0, left: 0 }}>
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
                                            const tooltipHeight = 30
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
                                        width={String(groupedData[key][i].value).length * 8 + 16 + 'px'}
                                        height={30}
                                    >
                                        <div
                                            className="data-label"
                                            style={{
                                                color: groupedData[key][i].color,
                                            }}
                                        >
                                            <p style={{ margin: 0 }}>{groupedData[key][i].value}</p>
                                        </div>
                                    </foreignObject>
                                )}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={3}
                                    fill={groupedData[key][0].color}
                                    stroke={groupedData[key][0].color}
                                    strokeWidth={1}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                />
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
                {Object.values(groupedData)[0]?.map((d, i) => {
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
                            {d.label}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default LineChart
