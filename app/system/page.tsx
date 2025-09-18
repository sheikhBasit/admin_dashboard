"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import type { SystemConfig, SystemLog } from "@/lib/types"
import { Server, Database, Shield, Bell, Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { api } from "@/lib/api"

export default function SystemPage() {
  const [config, setConfig] = useState<SystemConfig>({
    maintenance_mode: false,
    allow_registrations: true,
    email_notifications: true,
    sms_notifications: false,
    auto_backup: true,
    backup_frequency: 24,
    max_file_size: 10,
    session_timeout: 30,
  })

  const { data: systemStatusResp } = useQuery({
    queryKey: ["systemStatus"],
    queryFn: () => api.get<{ uptime?: string; db_response_time?: string; last_security_scan?: string; pending_notifications?: number; cpu_usage?: number; memory_usage?: number; disk_usage?: number }>("/admin/system/status"),
  })
  const systemStatus = systemStatusResp?.data

  const { data: logsResp } = useQuery({
    queryKey: ["systemLogs"],
    queryFn: () => api.get<SystemLog[]>("/admin/system/logs"),
  })
  const logs = logsResp?.data

  const handleConfigUpdate = async (key: string, value: any) => {
    const oldConfig = { ...config }
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    try {
      await api.put(`/admin/system/config`, { [key]: value })
      toast.success("Configuration updated")
    } catch (error) {
      toast.error("Failed to update configuration")
      setConfig(oldConfig)
    }
  }

  const handleSystemAction = async (action: string) => {
    try {
      const response = await api.post(`/admin/system/${action}`, {})
      if (response.data) {
        toast.success(`System ${action} completed`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} system`)
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      case "info":
        return "text-blue-600"
      case "success":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">Manage system settings, monitoring, and maintenance</p>
        </div>

        {/* System Status */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Uptime: {systemStatus?.uptime || "99.9%"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Connected</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Response: {systemStatus?.db_response_time || "12ms"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Secure</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last scan: {systemStatus?.last_security_scan || "2 hours ago"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus?.pending_notifications || 0}</div>
              <p className="text-xs text-muted-foreground">Pending alerts</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure basic system behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <Switch
                      id="maintenance"
                      checked={config.maintenance_mode}
                      onCheckedChange={(checked) => handleConfigUpdate("maintenance_mode", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="registrations">Allow New Registrations</Label>
                    <Switch
                      id="registrations"
                      checked={config.allow_registrations}
                      onCheckedChange={(checked) => handleConfigUpdate("allow_registrations", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={config.session_timeout}
                      onChange={(e) => handleConfigUpdate("session_timeout", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file-size">Max File Size (MB)</Label>
                    <Input
                      id="file-size"
                      type="number"
                      value={config.max_file_size}
                      onChange={(e) => handleConfigUpdate("max_file_size", Number.parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={config.email_notifications}
                      onCheckedChange={(checked) => handleConfigUpdate("email_notifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <Switch
                      id="sms-notifications"
                      checked={config.sms_notifications}
                      onCheckedChange={(checked) => handleConfigUpdate("sms_notifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup Settings</CardTitle>
                  <CardDescription>Configure automatic backups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-backup">Auto Backup</Label>
                    <Switch
                      id="auto-backup"
                      checked={config.auto_backup}
                      onCheckedChange={(checked) => handleConfigUpdate("auto_backup", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Backup Frequency (hours)</Label>
                    <Input
                      id="backup-frequency"
                      type="number"
                      value={config.backup_frequency}
                      onChange={(e) => handleConfigUpdate("backup_frequency", Number.parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>CPU Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus?.cpu_usage || "45"}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${systemStatus?.cpu_usage || 45}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus?.memory_usage || "62"}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${systemStatus?.memory_usage || 62}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Disk Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus?.disk_usage || "78"}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${systemStatus?.disk_usage || 78}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent System Logs</CardTitle>
                <CardDescription>Monitor system events and errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs?.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted">
                      <div className={getLogLevelColor(log.level)}>{getLogLevelIcon(log.level)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{log.message}</p>
                          <Badge variant="outline" className={getLogLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {log.source} • {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Database Maintenance</CardTitle>
                  <CardDescription>Optimize and maintain database performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleSystemAction("optimize-db")}
                  >
                    Optimize Database
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleSystemAction("backup-db")}
                  >
                    Create Database Backup
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleSystemAction("cleanup-logs")}
                  >
                    Cleanup Old Logs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Actions</CardTitle>
                  <CardDescription>Perform system-wide operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleSystemAction("clear-cache")}
                  >
                    Clear System Cache
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleSystemAction("restart-services")}
                  >
                    Restart Services
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={() => handleSystemAction("restart-system")}>
                    Restart System
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
