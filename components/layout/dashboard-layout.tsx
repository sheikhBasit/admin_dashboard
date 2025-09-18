"use client"

import type React from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar className="border-r bg-sidebar text-sidebar-foreground" />
      </div>

      <div className="flex-1">
        <Header />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</main>
      </div>
    </div>
  )
}
