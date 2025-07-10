// src/components/lineChart/components/LineGroup.tsx
import React from 'react'
import { DataPoint } from '../index'
import { toolTipRefType, tooltipSizesType } from '../types'

interface LineGroupProps {
    keyName: string
    labelMap: { [label: string]: DataPoint }
    visibleLabels: string[]
    startIndex: number
    yAxisWidth: number
    pointWidth: number
    getY: (value: number) => number
    chartHeight: number
    data: DataPoint[]
    hovered: { key: string; idx: number } | null
    customTooltip?: (data: DataPoint) => React.ReactNode
    customAllToolTip?: any
    tooltipRefs: toolTipRefType
    tooltipSizes: tooltipSizesType
    containerWidth: number
}

const LineGroup: React.FC<LineGroupProps> = ({
    keyName,
    labelMap,
    visibleLabels,
    startIndex,
    yAxisWidth,
    pointWidth,
    getY,
    chartHeight,
    data,
    hovered,
    customTooltip,
    customAllToolTip,
    tooltipRefs,
    tooltipSizes,
    containerWidth,
}) => {
    const points = visibleLabels.map((label, i) => {
        const d = labelMap[label]
        const globalIdx = startIndex + i
        const x = yAxisWidth + globalIdx * pointWidth
        const y = d ? getY(d.value) : chartHeight
        return { x, y, data: d, globalIdx }
    })

    return (
        <g>
            <polyline
                fill="none"
                stroke={data.find(d => d.key === keyName)?.color || '#000'}
                strokeWidth="2"
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
            />
            {points.map((p, i) => {
                const tooltipKey = `${keyName}_${p.globalIdx}`
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
                        {/* customAllToolTip이 없을 때만 dot별 툴팁 */}
                        {hovered && hovered.idx === p.globalIdx && p.data && !customAllToolTip && (
                            <foreignObject x={x} y={y} width={tooltipWidth} height={tooltipHeight}>
                                {customTooltip ? (
                                    <div
                                        ref={el => {
                                            tooltipRefs.current[tooltipKey] = el
                                        }}
                                        style={{ display: 'inline-block' }}
                                    >
                                        {customTooltip(p.data)}
                                    </div>
                                ) : (
                                    <div
                                        className="data-label"
                                        style={{
                                            color: p.data.color,
                                        }}
                                    >
                                        <p style={{ margin: 0 }}>{p.data.value}</p>
                                    </div>
                                )}
                            </foreignObject>
                        )}
                        {p.data && <circle cx={p.x} cy={p.y} r={3} fill={p.data.color} stroke={p.data.color} strokeWidth={1} />}
                    </g>
                )
            })}
        </g>
    )
}

export default LineGroup
