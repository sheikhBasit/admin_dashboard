"use client"

import { useState, useEffect } from "react"
import { apiClient, type ApiResponse } from "@/lib/api"
import { toast } from "@/components/ui/sonner"

export function useApiQuery<T>(
  queryKey: string[],
  endpoint: string,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  },
) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (options?.enabled === false) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get<T>(endpoint)
        if (response.error) {
          throw new Error(response.error)
        }
        setData(response.data!)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Simple interval refetch
    if (options?.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [endpoint, options?.enabled, options?.refetchInterval])

  return { data, isLoading, error }
}

export function useApiMutation<T, V = any>(
  endpoint: string,
  method: "POST" | "PUT" | "DELETE" = "POST",
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  },
) {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (data: V) => {
    try {
      setIsLoading(true)
      let response: ApiResponse<T>

      switch (method) {
        case "POST":
          response = await apiClient.post<T>(endpoint, data)
          break
        case "PUT":
          response = await apiClient.put<T>(endpoint, data)
          break
        case "DELETE":
          response = await apiClient.delete<T>(endpoint)
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }

      if (response.error) {
        throw new Error(response.error)
      }

      toast.success("Operation completed successfully")
      options?.onSuccess?.(response.data!)
      return response.data!
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      options?.onError?.(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

export function useApi<T>(
  endpoint: string | null,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  },
) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    if (!endpoint) return

    try {
      setIsLoading(true)
      const response = await apiClient.get<T>(endpoint)
      if (response.error) {
        throw new Error(response.error)
      }
      setData(response.data!)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (endpoint && options?.enabled !== false) {
      fetchData()
    }
  }, [endpoint, options?.enabled])

  return { data, isLoading, error, refetch: fetchData }
}

export function useApiWithMutate<T>(endpoint: string | null) {
  const query = useApi<T>(endpoint)

  const mutate = () => {
    if (endpoint) {
      query.refetch()
    }
  }

  return {
    ...query,
    mutate,
  }
}
