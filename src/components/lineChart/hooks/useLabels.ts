// src/components/lineChart/hooks/useLabels.ts
import { useMemo } from 'react'
import { DataPoint } from '../index'

const useLabels = (data: DataPoint[]) => {
    return useMemo(() => Array.from(new Set(data.map(d => d.label))), [data])
}

export default useLabels
