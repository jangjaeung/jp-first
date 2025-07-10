// src/components/lineChart/components/XAxisLabels.tsx
import React from 'react'
import { DataPoint } from '../index'

interface XAxisLabelsProps {
    visibleLabels: string[]
    startIndex: number
    yAxisWidth: number
    virtualWidth: number
    pointWidth: number
    data: DataPoint[]
    tickFormatter?: (data: DataPoint, idx: number, allData: DataPoint[]) => React.ReactNode
}

const XAxisLabels: React.FC<XAxisLabelsProps> = ({ visibleLabels, startIndex, yAxisWidth, virtualWidth, pointWidth, data, tickFormatter }) => (
    <div
        className="label-x"
        style={{
            left: yAxisWidth,
            width: virtualWidth - yAxisWidth,
        }}
    >
        {visibleLabels.map((label, i) => {
            const globalIdx = startIndex + i
            const sampleData = data.find(d => d.label === label)
            return (
                <div
                    key={globalIdx}
                    style={{
                        width: pointWidth,
                        left: globalIdx * pointWidth,
                    }}
                >
                    {tickFormatter ? tickFormatter(sampleData ?? { key: '', label, value: 0, color: '' }, globalIdx, data) : label}
                </div>
            )
        })}
    </div>
)

export default XAxisLabels
