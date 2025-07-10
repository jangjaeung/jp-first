type YAxisLabelsProps = {
    yScales: number[]
    getY: (val: number) => number
    yAxisWidth: number
    chartHeight: number
}

const YAxisLabels = ({ yScales, getY, yAxisWidth, chartHeight }: YAxisLabelsProps) => (
    <div className="label-y" style={{ width: yAxisWidth, height: chartHeight + 10 }}>
        {yScales.map((val, idx) => {
            const y = getY(val)
            return (
                <div key={idx} style={{ top: y - 10 }}>
                    {val}
                </div>
            )
        })}
    </div>
)

export default YAxisLabels
