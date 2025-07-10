import { useCallback, useMemo, useRef, useState } from 'react'
import LineGroup from './components/lineGroup'
import XAxisLabels from './components/xAxisLabels'
import YAxisLabels from './components/yAxisLabels'
import { POINT_WIDTH } from './const'
import useLabels from './hooks/useLabels'
import useResize from './hooks/useResize'
import useScroll from './hooks/useScroll'
import useToolTip from './hooks/useToolTip' // 추가
import useXAxis from './hooks/useXAxis'
import useYAxis from './hooks/useYAxis'
import './styles'
import { ILineChart } from './types'

export type DataPoint = { key: string; label: string; value: number; color: string }

/**
 *
 * @param data 같은 key를 기준으로 라인 생성
 * @param chartHeight 세로 크기
 * @param yTicks  Y축 틱 갯수
 * @param yAxisWidth 이 값이 커지면 Y축 라벨이 넓게 보이고, 작아지면 라벨이 차트와 더 가까워짐
 * @param paddingRatio 최상단 마진 비율
 * @param customTooltip 마우스 호버시 노출할 개별 포인트 툴팁 customAllToolTip과 중복 사용 불가능
 * @param customAllToolTip 마우스 호버시 노출할 전체 툴팁 customTooltip과 중복 사용 불가능
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
    customAllToolTip,
    tickFormatter,
    isScroll = false,
    pointWidth = POINT_WIDTH,
}: ILineChart) => {
    const [hovered, setHovered] = useState<{ key: string; idx: number } | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const labels = useLabels(data)

    // 컨테이너 리사이즈 감지
    const containerWidth = useResize(containerRef)

    // key별로 label별 DataPoint 매핑
    const groupedData = useMemo(() => {
        const groups: { [key: string]: { [label: string]: DataPoint } } = {}
        data.forEach(point => {
            if (!groups[point.key]) groups[point.key] = {}
            groups[point.key][point.label] = point
        })
        return groups
    }, [data])

    // 스크롤 관련 계산
    const { scrollLeft, handleScroll } = useScroll(containerRef, isScroll, labels.length)

    // X축 관련 계산
    const { virtualWidth, startIndex, endIndex, visibleLabels } = useXAxis({
        pointWidth,
        containerWidth,
        scrollLeft,
        isScroll,
        labels,
    })

    // y축 관련 계산
    const { yScales, getY } = useYAxis({
        data,
        chartHeight,
        yTicks,
        paddingRatio,
    })

    // 툴팁 관련 계산
    const { tooltipSizes, tooltipRefs, getCustomAllTooltipProps } = useToolTip({
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
    })

    // 마우스 hover
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
            const svgRect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - svgRect.left
            const idx = Math.round((x - yAxisWidth) / pointWidth)
            if (idx >= 0 && idx < labels.length) {
                setHovered({ key: '', idx }) // key는 아래에서 사용
            } else {
                setHovered(null)
            }
        },
        [labels.length, pointWidth, yAxisWidth],
    )
    const handleMouseLeave = useCallback(() => setHovered(null), [])

    // lineAreaWidth 계산 (virtualWidth 사용)
    const lineAreaWidth = Math.max(0, virtualWidth - yAxisWidth)

    // customAllToolTip 렌더링 함수
    const renderCustomAllTooltip = () => {
        const props = getCustomAllTooltipProps()
        if (!props || !customAllToolTip) return null
        return (
            <foreignObject x={props.x} y={props.y} width={props.width} height={props.height} style={{ pointerEvents: 'none', zIndex: 20 }}>
                <div ref={props.ref} style={{ display: 'inline-block' }}>
                    {customAllToolTip(props.allData)}
                </div>
            </foreignObject>
        )
    }

    return (
        <div
            id="lineChart"
            style={{
                height: chartHeight + 40,
            }}
        >
            {/* Y축 라벨 */}
            <YAxisLabels yScales={yScales} getY={getY} yAxisWidth={yAxisWidth} chartHeight={chartHeight} />

            {/* 차트 영역 */}
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

                    {/* 선 + 포인트 */}
                    <svg
                        width={virtualWidth}
                        height={chartHeight + 40}
                        style={{ position: 'absolute', top: 0, left: 0, zIndex: 3 }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* 세로선(hover line) */}
                        {hovered && hovered.idx >= startIndex && hovered.idx < endIndex && (
                            <line
                                x1={yAxisWidth + hovered.idx * pointWidth}
                                y1={0}
                                x2={yAxisWidth + hovered.idx * pointWidth}
                                y2={chartHeight}
                                stroke="#E2E2E9"
                                strokeDasharray="3 2"
                                style={{ zIndex: 10 }}
                            />
                        )}
                        {/* key별 라인 */}
                        {Object.entries(groupedData).map(([key, labelMap]) => (
                            <LineGroup
                                key={key}
                                keyName={key}
                                labelMap={labelMap}
                                visibleLabels={visibleLabels}
                                startIndex={startIndex}
                                yAxisWidth={yAxisWidth}
                                pointWidth={pointWidth}
                                getY={getY}
                                chartHeight={chartHeight}
                                data={data}
                                hovered={hovered}
                                customTooltip={customTooltip}
                                customAllToolTip={customAllToolTip}
                                tooltipRefs={tooltipRefs}
                                tooltipSizes={tooltipSizes}
                                containerWidth={containerWidth}
                            />
                        ))}

                        {/* customAllToolTip 렌더링 (hovered가 있고, customAllToolTip이 있을 때) */}
                        {customAllToolTip && hovered && renderCustomAllTooltip()}
                    </svg>

                    {/* X축 라벨 */}
                    <XAxisLabels
                        visibleLabels={visibleLabels}
                        startIndex={startIndex}
                        yAxisWidth={yAxisWidth}
                        virtualWidth={virtualWidth}
                        pointWidth={pointWidth}
                        data={data}
                        tickFormatter={tickFormatter}
                    />
                </div>
            </div>
        </div>
    )
}

export default LineChart
