import { DynamicKey } from '@/components/types'
import _lazy from '@/utils/lazyUtil'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const layoutComp: DynamicKey<any> = {
    home: _lazy(() => import('@/pages/home')),
}
