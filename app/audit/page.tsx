"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DynamicTable } from "@/components/ui/dynamic-table"
import { api } from "@/lib/api"
import type { TableColumn } from "@/lib/types"
import type {
  AuditLog,
  AuditActionStat,
  AuditUserActivity,
  AuditLogsResponse,
  AuditActionsSummaryResponse,
  AuditUserActivitySummaryResponse
} from "@/lib/audit-types"
import { Search, Download, Eye, Clock, User, Activity } from "lucide-react"

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")

  const { data: auditLogs, isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ["audit", "logs"],
    queryFn: async () => (await api.get<AuditLog[]>("/admin/audit/logs")).data as AuditLog[] ?? [],
  })

  const { data: auditActions, isLoading: actionsLoading } = useQuery<AuditActionsSummaryResponse>({
    queryKey: ["audit", "actions"],
    queryFn: async () => (await api.get<AuditActionsSummaryResponse>("/admin/audit/actions")).data as AuditActionsSummaryResponse,
  })

  const { data: userActivity, isLoading: userActivityLoading } = useQuery<AuditUserActivitySummaryResponse>({
    queryKey: ["audit", "users"],
    queryFn: async () => (await api.get<AuditUserActivitySummaryResponse>("/admin/audit/users")).data as AuditUserActivitySummaryResponse,
  })

  const auditColumns: TableColumn<AuditLog>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "timestamp", label: "Timestamp", sortable: true },
    { key: "user_id", label: "User", sortable: true },
    { key: "action", label: "Action", sortable: true },
    { key: "resource", label: "Resource", sortable: true },
    { key: "ip_address", label: "IP Address" },
    {
      key: "status",
      label: "Status",
      render: (value: AuditLog["status"]) => <Badge variant={value === "success" ? "default" : "destructive"}>{value}</Badge>,
    },
  ]

  const actionColumns: TableColumn<AuditActionStat & { id: string }>[] = [
    { key: "action", label: "Action Type" },
    { key: "count", label: "Count", sortable: true },
    { key: "last_performed", label: "Last Performed", sortable: true },
    { key: "success_rate", label: "Success Rate", render: (value) => `${value}%` },
  ]

  const userActivityColumns: TableColumn<AuditUserActivity & { id: string }>[] = [
    { key: "user_id", label: "User ID" },
    { key: "username", label: "Username" },
    { key: "total_actions", label: "Total Actions", sortable: true },
    { key: "last_activity", label: "Last Activity", sortable: true },
    {
      key: "risk_score",
      label: "Risk Score",
      render: (value: number) => (
        <Badge variant={value > 70 ? "destructive" : value > 40 ? "secondary" : "default"}>{value}</Badge>
      ),
    },
  ]

  

  // If you have a table for action stats, use AuditActionStat[] and define columns accordingly

  // If you have a table for user activity, use AuditUserActivity[] and define columns accordingly

  const handleExportLogs = () => {
    // Export audit logs functionality
    console.log("Exporting audit logs...")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit & Logs</h1>
          <p className="text-muted-foreground">Monitor system activities and administrative actions</p>
        </div>
        <Button onClick={handleExportLogs} className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditActions?.total_actions ?? 0}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userActivity?.active_users ?? 0}</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditActions?.failed_actions ?? 0}</div>
            <p className="text-xs text-muted-foreground">-8% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Users</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userActivity?.high_risk_users ?? 0}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="actions">Action Statistics</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Complete record of all administrative actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="mechanic">Mechanics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DynamicTable
                data={Array.isArray(auditLogs) ? auditLogs : []}
                columns={auditColumns}
                title="Audit Logs"
                loading={logsLoading}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Action Statistics</CardTitle>
              <CardDescription>Overview of different action types and their frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicTable
                data={Array.isArray(auditActions?.actions)
                  ? auditActions.actions.map((a) => ({ ...a, id: a.action }))
                  : []}
                columns={actionColumns}
                title="Action Statistics"
                loading={actionsLoading}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Monitor user behavior and identify potential security risks</CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicTable
                data={Array.isArray(userActivity?.users)
                  ? userActivity.users.map((u) => ({ ...u, id: u.user_id }))
                  : []}
                columns={userActivityColumns}
                title="User Activity"
                loading={userActivityLoading}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
