"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const userGrowthData = [
  { month: "Jan", users: 1200, mechanics: 45 },
  { month: "Feb", users: 1350, mechanics: 52 },
  { month: "Mar", users: 1500, mechanics: 58 },
  { month: "Apr", users: 1680, mechanics: 65 },
  { month: "May", users: 1850, mechanics: 72 },
  { month: "Jun", users: 2100, mechanics: 80 },
]

const serviceStatusData = [
  { name: "Completed", value: 65, color: "hsl(var(--primary))" },
  { name: "In Progress", value: 25, color: "hsl(var(--secondary))" },
  { name: "Pending", value: 10, color: "hsl(var(--muted))" },
]

const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 15000 },
  { month: "Mar", revenue: 18000 },
  { month: "Apr", revenue: 22000 },
  { month: "May", revenue: 25000 },
  { month: "Jun", revenue: 28000 },
]

function SimpleBarChart({ data, title }: { data: any[]; title: string }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.users || 0, d.mechanics || 0, d.revenue || 0)))

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-8 text-xs">{item.month}</div>
            <div className="flex-1 flex space-x-1">
              {item.users && (
                <div
                  className="bg-primary h-4 rounded"
                  style={{ width: `${(item.users / maxValue) * 100}%` }}
                  title={`Users: ${item.users}`}
                />
              )}
              {item.mechanics && (
                <div
                  className="bg-secondary h-4 rounded"
                  style={{ width: `${(item.mechanics / maxValue) * 100}%` }}
                  title={`Mechanics: ${item.mechanics}`}
                />
              )}
              {item.revenue && (
                <div
                  className="bg-primary h-4 rounded"
                  style={{ width: `${(item.revenue / maxValue) * 100}%` }}
                  title={`Revenue: $${item.revenue}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SimplePieChart({ data, title }: { data: any[]; title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>User & Mechanic Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={userGrowthData} title="" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <SimplePieChart data={serviceStatusData} title="" />
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={revenueData} title="" />
        </CardContent>
      </Card>
    </div>
  )
}
