import classNames from 'classnames'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { CIR_CUM_FERENCE, GAP, RADIUS, STROKE_WIDTH } from './const'

export interface ICircleData {
    label: string // 라벨(항목명)
    value: number // 값(비율)
    color: string // 색상
}

type CircleChartProp = {
    data: ICircleData[] // 차트 데이터 배열
    classList?: string[] // 추가 클래스 리스트
    isLabel?: boolean // 라벨 노출 여부
    renderLabel?: (item: ICircleData, idx: number) => React.ReactNode // 커스텀 라벨 렌더 함수
    renderTooltip?: (item: ICircleData) => React.ReactNode // 커스텀 툴팁 렌더 함수
}

/**
 * @param data {label, value, color}[] - 차트 데이터
 * @param classList - 추가 클래스
 * @param isLabel - 라벨 노출 여부
 * @param renderLabel - 커스텀 라벨 렌더 함수
 * @param renderTooltip - 커스텀 툴팁 렌더 함수
 */
const CircleChart = ({ data, classList = [], isLabel = true, renderLabel, renderTooltip }: CircleChartProp) => {
    // 마우스 오버된 인덱스
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
    // 툴팁 (좌표, 라벨, 값, 색상)
    const [tooltip, setTooltip] = useState<{
        pageX: number
        pageY: number
        label: string
        value: number
        color: string
    } | null>(null)
    // 차트 컨테이너 ref (툴팁 위치 계산용)
    const containerRef = useRef<HTMLDivElement>(null)

    // 전체 값 합계
    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data])

    // 마우스가 원에 올라갔을 때 툴팁 위치 및 정보 계산
    const handleMouseMove = useCallback(
        (e: React.MouseEvent, index: number, item: ICircleData) => {
            setHoveredIdx(index) // 현재 마우스가 올라간 인덱스

            // 현재 타겟이 된 SVG
            const svg = (e.currentTarget as SVGCircleElement).ownerSVGElement as SVGSVGElement
            // SVG의 브라우저 내 위치와 크기 정보
            const svgRect = svg.getBoundingClientRect()

            // 첫 번째 데이터의 dash 길이 계산 (원 둘레 비율 * 전체 둘레 - 간격)
            const firstDash = (data[0].value / total) * CIR_CUM_FERENCE - GAP
            // 첫 번째 dash의 절반만큼 offset을 음수로 시작 (그래프 시작 위치: 첫번째 인덱스 기준 중앙이 차트 가운대로 오게끔)
            let offset = -firstDash / 2

            // index 이전까지의 모든 dash+GAP의 합을 offset에 더함
            offset += data.slice(0, index).reduce((acc, cur) => {
                // 각 데이터의 dash 길이 계산
                const dash = (cur.value / total) * CIR_CUM_FERENCE - GAP
                // 누적값에 dash와 GAP을 더해서 반환
                return acc + dash + GAP
            }, 0)

            // 현재 아이템의 dash 길이 계산
            const dash = (item.value / total) * CIR_CUM_FERENCE - GAP
            // 시작 각도 계산 (offset을 각도로 변환, 12시 방향이 0도)
            const startAngle = (offset / CIR_CUM_FERENCE) * 360 - 90
            // 해당 섹터의 중간 각도 계산
            const midAngle = startAngle + ((dash / CIR_CUM_FERENCE) * 360) / 2
            // 중간 각도를 라디안으로 변환
            const rad = (midAngle * Math.PI) / 180
            // 원의 중심(80,80)에서 중간 각도 방향으로 RADIUS만큼 떨어진 x좌표
            const svgX = 80 + RADIUS * Math.cos(rad)
            // 원의 중심(80,80)에서 중간 각도 방향으로 RADIUS만큼 떨어진 y좌표
            const svgY = 80 + RADIUS * Math.sin(rad)

            // 툴팁 위치 및 내용 상태로 저장
            setTooltip({
                pageX: svgRect.left + window.scrollX + svgX, // 툴팁의 화면상 x좌표
                pageY: svgRect.top + window.scrollY + svgY, // 툴팁의 화면상 y좌표
                label: item.label, // 툴팁에 표시할 라벨
                value: item.value, // 툴팁에 표시할 값
                color: item.color, // 툴팁 테두리 색상
            })
        },
        [data, total],
    )

    // 마우스가 원에서 벗어났을 때 상태 초기화
    const handleMouseLeave = useCallback(() => {
        setHoveredIdx(null)
        setTooltip(null)
    }, [])

    // 데이터가 없을 때(합계 0) 예외
    if (total === 0 || data.length === 0) {
        return (
            <div className={classNames(['circle-chart', ...classList])} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                    {/* 배경 원 */}
                    <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#f0f0f0" strokeWidth={STROKE_WIDTH} />
                    {/* 중앙에 0개 표시 */}
                    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="bold">
                        0개
                    </text>
                </svg>
            </div>
        )
    }

    // 첫 번째 dash와 offset 계산 (차트 시작 위치)
    const firstDash = (data[0].value / total) * CIR_CUM_FERENCE - GAP
    let offset = -firstDash / 2

    // 각 데이터별로 원형 차트의 섹터(circle) 생성
    const circles = data.map((item, index) => {
        // 해당 데이터의 dash 길이 계산
        const dash = (item.value / total) * CIR_CUM_FERENCE - GAP

        // 마우스 진입 이벤트 핸들러
        const handleMouseEnter = (e: React.MouseEvent) => {
            handleMouseMove(e, index, item)
        }

        // SVG 엘리먼트 생성
        const circle = (
            <circle
                key={index}
                cx="80"
                cy="80"
                r={RADIUS}
                fill="none"
                stroke={item.color}
                strokeWidth={hoveredIdx === index ? STROKE_WIDTH * 1.7 : STROKE_WIDTH} // hover 시 두껍게
                strokeDasharray={`${dash > 0 ? dash : 0} ${CIR_CUM_FERENCE - dash}`} // dash 길이
                strokeDashoffset={-offset + CIR_CUM_FERENCE / 4} // 시작 위치 조정
                strokeLinecap="butt"
                style={{
                    filter: hoveredIdx === index ? 'drop-shadow(0 0 6px rgba(0,0,0,0.2))' : undefined, // hover 시 그림자
                    opacity: hoveredIdx === null || hoveredIdx === index ? 1 : 0.5, // hover 시 강조
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseMove={e => handleMouseMove(e, index, item)}
                onMouseLeave={handleMouseLeave}
            />
        )
        // 다음 섹터를 위해 offset 갱신
        offset += dash + GAP
        return circle
    })

    return (
        <div
            ref={containerRef}
            className={classNames(['circle-chart', ...classList])}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
        >
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ display: 'block' }}>
                {/* 배경 원 */}
                <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#f0f0f0" strokeWidth={STROKE_WIDTH} />
                {/* 데이터별 섹터 */}
                {circles}
                {/* 중앙에 전체 개수 표시 */}
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="bold">
                    {total}개
                </text>
            </svg>
            {/* 라벨 영역 */}
            {isLabel && (
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 16 }}>
                    {data.map((item, idx) =>
                        // 커스텀라벨 / 기본 라벨
                        renderLabel ? (
                            <React.Fragment key={idx}>{renderLabel(item, idx)}</React.Fragment>
                        ) : (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {/* 색상 점 */}
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: item.color,
                                        marginRight: 4,
                                    }}
                                />
                                {/* 라벨명 */}
                                <span style={{ fontSize: 14 }}>{item.label}</span>
                                {/* 값 */}
                                <span style={{ color: item.color, fontWeight: 'bold', marginLeft: 4 }}>{item.value}</span>
                            </div>
                        ),
                    )}
                </div>
            )}
            {/* 툴팁 영역 */}
            {tooltip && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltip.pageX - (containerRef.current?.getBoundingClientRect().left ?? 0) - 40,
                        top: tooltip.pageY - (containerRef.current?.getBoundingClientRect().top ?? 0) - 36,
                        background: '#fff',
                        border: `1.5px solid ${tooltip.color}`,
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 13,
                        color: '#222',
                        fontWeight: 500,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        minWidth: 60,
                    }}
                >
                    {/* 커스텀 툴팁 / 기본 툴팁 */}
                    {renderTooltip ? (
                        renderTooltip({ label: tooltip.label, value: tooltip.value, color: tooltip.color })
                    ) : (
                        <>
                            <span style={{ color: tooltip.color, fontWeight: 700 }}>{tooltip.label}</span>: {tooltip.value}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default CircleChart
