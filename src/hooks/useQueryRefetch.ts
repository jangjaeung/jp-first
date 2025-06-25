import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export const useQueryRefetch = () => {
    const queryClient = useQueryClient()

    const useRefetch = useCallback(<T>(queryKey: Array<string | T>) => {
        if (queryKey.length) {
            queryClient.refetchQueries({ queryKey })
        }
    }, [])

    return { useRefetch }
}
