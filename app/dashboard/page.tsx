"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"
import type { DashboardOverview, DashboardMetrics, DashboardActivity, DashboardNotifications } from "@/lib/types"
import { Users, Wrench, Car, MessageSquare, AlertTriangle, CheckCircle, Clock, Bell, Activity } from "lucide-react"
import { useState, useEffect } from "react" 
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

// ----------------------------------------------------------------------------------
// 1. STATIC DUMMY DATA DEFINITIONS
// ----------------------------------------------------------------------------------

const DUMMY_USER_GROWTH_DATA = [
  { month: "Jan", users: 400 },
  { month: "Feb", users: 550 },
  { month: "Mar", users: 700 },
  { month: "Apr", users: 850 },
  { month: "May", users: 1100 },
  { month: "Jun", users: 1350 },
];

const DUMMY_SERVICE_DISTRIBUTION_DATA = [
  { name: "Diagnosis", value: 35 },
  { name: "Maintenance", value: 45 },
  { name: "Repairs", value: 20 },
];

const DUMMY_REVENUE_DATA = [
  { month: "Jan", revenue: 5000 },
  { month: "Feb", revenue: 7200 },
  { month: "Mar", revenue: 6500 },
  { month: "Apr", revenue: 9800 },
  { month: "May", revenue: 11000 },
  { month: "Jun", revenue: 13500 },
];

// ----------------------------------------------------------------------------------
// 2. UTILITY FUNCTIONS
// ----------------------------------------------------------------------------------

/**
 * Generates a realistic fluctuating value around the current value within specified bounds.
 */
const fluctuate = (current: number, min: number, max: number, range: number = 3): number => {
  const change = Math.floor(Math.random() * (range * 2 + 1)) - range; 
  let next = current + change;
  
  if (next > max) next = max;
  if (next < min) next = min;
  
  return next;
};

/**
 * Determines the color class for the progress bar based on the value.
 */
const getProgressColor = (value: number): string => {
  if (value > 80) return "bg-red-500";
  if (value > 60) return "bg-yellow-500";
  return "bg-green-500";
};

// ----------------------------------------------------------------------------------
// 3. COMPONENT LOGIC
// ----------------------------------------------------------------------------------

export default function DashboardPage() {
  
  // 1. STATE FOR DYNAMIC SYSTEM HEALTH
  const [systemHealth, setSystemHealth] = useState({
    cpu: 18,    
    memory: 45, 
    disk: 72,   
  });

  // 2. DATA FETCHING (QUERIES MUST BE DECLARED BEFORE useEffect THAT USES THEM)
  const { data: overviewResp } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => api.get<DashboardOverview>("/admin/overview"),
  })
  const overview = overviewResp?.data;

  const { data: metricsResp } = useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: () => api.get<DashboardMetrics>("/admin/analytics/services"),
  })
  const metrics = metricsResp?.data;

  const { data: activityResp } = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => api.get<DashboardActivity>("/admin/analytics/activity"),
  })
  const activity = activityResp?.data;

  const { data: notificationsResp } = useQuery({
    queryKey: ["dashboard", "notifications"],
    queryFn: () => api.get<DashboardNotifications>("/admin/analytics/notifications"),
  })
  const notifications = notificationsResp?.data;

  // 3. EFFECT TO HANDLE FLUCTUATION TIMER 
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Logic only runs if the real data hasn't loaded
      if (!overview?.system_health) { 
        setSystemHealth(prev => ({
          cpu: fluctuate(prev.cpu, 5, 30, 2),    
          memory: fluctuate(prev.memory, 40, 70, 3), 
          disk: fluctuate(prev.disk, 70, 90, 1)   
        }));
      }
    }, 2000); 

    return () => clearInterval(intervalId);
  }, [overview?.system_health]); // Dependency now correctly references 'overview'

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Helper to safely get the current system value (real or dummy)
  const cpuValue = overview?.system_health?.cpu ?? systemHealth.cpu;
  const memoryValue = overview?.system_health?.memory ?? systemHealth.memory;
  const diskValue = overview?.system_health?.disk ?? systemHealth.disk;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.total_users || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Mechanics</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.total_mechanics || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.total_services || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.total_chats || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={overview?.user_growth_data || DUMMY_USER_GROWTH_DATA}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Breakdown of service types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={overview?.service_distribution || DUMMY_SERVICE_DISTRIBUTION_DATA}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name} ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(overview?.service_distribution || DUMMY_SERVICE_DISTRIBUTION_DATA).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" /> {/* <--- ADDED LEGEND */}
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* System Health with Color Coding */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system performance and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-muted-foreground">{cpuValue}%</span>
                    </div>
                    {/* Applying dynamic color class */}
                    <Progress value={cpuValue} className={getProgressColor(cpuValue)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-muted-foreground">{memoryValue}%</span>
                    </div>
                    {/* Applying dynamic color class */}
                    <Progress value={memoryValue} className={getProgressColor(memoryValue)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-muted-foreground">{diskValue}%</span>
                    </div>
                    {/* Applying dynamic color class */}
                    <Progress value={diskValue} className={getProgressColor(diskValue)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                  <CardDescription>Financial performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics?.revenue_data || DUMMY_REVENUE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Service Completion Rate</span>
                    <Badge variant="default">{metrics?.completion_rate || 0}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <Badge variant="secondary">{metrics?.avg_response_time || 0}min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <Badge variant="default">{metrics?.satisfaction_score || 0}/5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mechanic Utilization</span>
                    <Badge variant="secondary">{metrics?.mechanic_utilization || 0}%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(activity?.recent_activities || []).map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {item.type === "user_registration" && <Users className="h-4 w-4 text-blue-500" />}
                        {item.type === "service_request" && <Car className="h-4 w-4 text-green-500" />}
                        {item.type === "mechanic_verification" && <CheckCircle className="h-4 w-4 text-purple-500" />}
                        {item.type === "system_alert" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.description}</p>
                        <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                      </div>
                      <Badge variant={item.status === "completed" ? "default" : "secondary"}>{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>Important alerts and system messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(notifications?.notifications || []).map((notification: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {notification.priority === "high" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {notification.priority === "medium" && <Clock className="h-5 w-5 text-yellow-500" />}
                        {notification.priority === "low" && <Bell className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                      </div>
                      <Badge
                        variant={
                          notification.priority === "high"
                            ? "destructive"
                            : notification.priority === "medium"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}