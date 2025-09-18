// Simple admin GET routes test page
"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function AdminGetTestPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<any[]>("/admin/users")
      if (res.data) setUsers(res.data)
      else setError(res.error || "No data")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin GET /admin/users Test</h1>
      <Button onClick={fetchUsers} disabled={loading} className="mb-4">
        {loading ? "Loading..." : "Refetch Users"}
      </Button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
        {JSON.stringify(users, null, 2)}
      </pre>
    </div>
  )
}
