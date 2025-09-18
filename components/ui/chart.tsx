"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactNode
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div data-chart={chartId} className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltip({ children }: { children: React.ReactNode }) {
  return <div className="bg-background border rounded-lg p-2 shadow-lg">{children}</div>
}

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: any[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-background border rounded-lg p-2 shadow-lg">
      {label && <p className="font-medium">{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="text-sm">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function ChartLegend({ payload }: { payload?: any[] }) {
  if (!payload?.length) return null

  return (
    <div className="flex items-center justify-center gap-4 pt-3">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function ChartLegendContent({ payload }: { payload?: any[] }) {
  return <ChartLegend payload={payload} />
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }
