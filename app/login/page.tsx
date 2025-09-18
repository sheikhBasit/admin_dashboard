"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setusername] = useState("johndoe13@example.com")
  const [password, setPassword] = useState("Str0ngP@ssword")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  try {
    const formData = new URLSearchParams()
formData.append("username", username)
formData.append("password", password)

const res = await api.post<{ access_token: string }>(
  "/auth/token",
  formData
)
    if (res.data?.access_token) {
      localStorage.setItem("access_token", res.data.access_token)
      toast.success("Login successful")
      router.push("/dashboard")
    } else {
      toast.error(res.error || "Invalid credentials")
    }
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-gray-600 p-8 rounded shadow-md w-96 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <Input
          type="email"
          value={username}
          onChange={e => setusername(e.target.value)}
          placeholder="Email"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  )
}
