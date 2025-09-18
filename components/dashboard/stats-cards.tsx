"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, Wrench, Car, Star } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  description?: string
}

function StatsCard({ title, value, change, icon, description }: StatsCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
            {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
            <Badge variant={isPositive ? "default" : isNegative ? "destructive" : "secondary"}>
              {change > 0 ? "+" : ""}
              {change}%
            </Badge>
            <span>from last month</span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  data: {
    users: { total: number; growth_rate: number }
    mechanics: { total: number; verified: number }
    services: { total: number; completion_rate: number }
    feedback: { average_rating: number }
  }
}

export function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={data.users.total.toLocaleString()}
        change={data.users.growth_rate}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Active user accounts"
      />
      <StatsCard
        title="Verified Mechanics"
        value={data.mechanics.verified}
        icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
        description={`${data.mechanics.total} total mechanics`}
      />
      <StatsCard
        title="Service Requests"
        value={data.services.total.toLocaleString()}
        change={data.services.completion_rate}
        icon={<Car className="h-4 w-4 text-muted-foreground" />}
        description="All time requests"
      />
      <StatsCard
        title="Average Rating"
        value={data.feedback.average_rating.toFixed(1)}
        icon={<Star className="h-4 w-4 text-muted-foreground" />}
        description="Customer satisfaction"
      />
    </div>
  )
}
