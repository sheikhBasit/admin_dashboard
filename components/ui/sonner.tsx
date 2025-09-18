"use client"

import { useState, useEffect } from "react"

type Toast = {
  id: string
  message: string
  type: "success" | "error" | "info"
}

let toasts: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
  const id = Math.random().toString(36).substr(2, 9)
  const toast = { id, message, type }
  toasts = [...toasts, toast]
  listeners.forEach((listener) => listener(toasts))

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    listeners.forEach((listener) => listener(toasts))
  }, 3000)
}

export const toast = {
  success: (message: string) => addToast(message, "success"),
  error: (message: string) => addToast(message, "error"),
  info: (message: string) => addToast(message, "info"),
}

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts)
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
