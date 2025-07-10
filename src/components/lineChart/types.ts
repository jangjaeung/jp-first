import { DataPoint } from '.'

type BaseLineChartProps = {
    data: DataPoint[]
    chartHeight?: number
    yTicks?: number
    yAxisWidth?: number
    paddingRatio?: number
    tickFormatter?: (data: DataPoint, idx: number, arr?: DataPoint[]) => string
    isScroll?: boolean
    pointWidth?: number
}

// customTooltip만 받는 경우
type SingleTooltipProps = {
    customTooltip: (data: DataPoint) => React.ReactNode
    customAllToolTip?: never
}

// customAllToolTip만 받는 경우
type AllTooltipProps = {
    customTooltip?: never
    customAllToolTip: (data: DataPoint[]) => React.ReactNode
}

// 둘 다 없어도 허용
type NoTooltipProps = {
    customTooltip?: never
    customAllToolTip?: never
}

// 둘 중 하나만 허용
export type ILineChart = BaseLineChartProps & (SingleTooltipProps | AllTooltipProps | NoTooltipProps)

export type toolTipRefType = React.MutableRefObject<{
    [key: string]: HTMLDivElement | null
}>

export type tooltipSizesType = {
    [key: string]: {
        width: number
        height: number
    }
}
