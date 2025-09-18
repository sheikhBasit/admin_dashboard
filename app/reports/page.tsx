"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DynamicTable } from "@/components/ui/dynamic-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { useQuery } from "@tanstack/react-query"
import type { Report, TableColumn } from "@/lib/types"
import { FileText, Download, Plus, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { api } from "@/lib/api"
import { toast } from "sonner"



function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [reportType, setReportType] = useState("")
  type DateRange = { from: Date; to: Date } | undefined
  const [dateRange, setDateRange] = useState<DateRange>()

  const { data: reportsResp, isLoading, refetch } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api.get<Report[]>("/admin/reports"),
  })
  const reports = reportsResp?.data || []

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownload = async (report: Report) => {
    try {
      const response = await api.get<Blob>(`/admin/reports/${report.id}/download`)
      if (response.data) {
        const blob = response.data as Blob
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = report.filename || `${report.title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Report downloaded")
      }
    } catch (error) {
      toast.error("Failed to download report")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "generating":
        return "bg-blue-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const reportColumns: TableColumn<Report>[] = [
    { key: "id", label: "ID" },
    { key: "title", label: "Report Title" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Created" },
    {
      key: "file_size",
      label: "Size",
      render: (value) => value ? formatFileSize(value as number) : "N/A"
    },
    {
      key: "id",
      label: "Actions",
      render: (_id, report) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => { setSelectedReport(report); setIsViewOpen(true); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDownload(report)} disabled={report.status !== "completed"}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ]

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast.error("Please select a report type")
      return
    }

    try {
      const response = await api.post(`/admin/reports/generate`, {
        type: reportType,
        date_range: dateRange && dateRange.from && dateRange.to
          ? {
              start: dateRange.from.toISOString(),
              end: dateRange.to.toISOString(),
            }
          : null,
      })
  if (response.data) {
        toast.success("Report generation started")
        refetch()
        setIsGenerateOpen(false)
        setReportType("")
        setDateRange(undefined)
      }
    } catch (error) {
      toast.error("Failed to generate report")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate and download business reports</p>
          </div>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>Select the type of report and date range you want to generate</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue Report</SelectItem>
                      <SelectItem value="services">Services Report</SelectItem>
                      <SelectItem value="customers">Customer Report</SelectItem>
                      <SelectItem value="mechanics">Mechanics Report</SelectItem>
                      <SelectItem value="vehicles">Vehicles Report</SelectItem>
                      <SelectItem value="feedback">Feedback Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <DatePickerWithRange
                    date={dateRange}
                    setDate={date => {
                      if (date && date.from && date.to) {
                        setDateRange({ from: date.from, to: date.to })
                      } else {
                        setDateRange(undefined)
                      }
                    }}
                  />
                </div>
                <Button onClick={handleGenerateReport} className="w-full">
                  Generate Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reports?.filter((r) => r.status === "completed").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {reports?.filter((r) => r.status === "generating").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports?.filter((r) => {
                  const reportDate = new Date(r.created_at)
                  const now = new Date()
                  return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
                }).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <DynamicTable<Report>
          data={reports || []}
          columns={reportColumns}
          title="Reports"
          loading={isLoading}
          searchable
          filterable
        />

        {/* Report Detail View */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedReport.title}</h3>
                    <p className="text-muted-foreground">{selectedReport.type} Report</p>
                    <Badge className={getStatusColor(selectedReport.status)} variant="secondary">
                      {selectedReport.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Created {formatDistanceToNow(new Date(selectedReport.created_at), { addSuffix: true })}
                    </div>
                    {selectedReport.file_size && (
                      <div className="text-sm text-muted-foreground">
                        Size: {formatFileSize(selectedReport.file_size)}
                      </div>
                    )}
                  </div>
                </div>

                {selectedReport.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                  </div>
                )}

                {selectedReport.parameters && (
                  <div>
                    <h4 className="font-semibold mb-2">Parameters</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <pre className="text-sm">{JSON.stringify(selectedReport.parameters, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {selectedReport.status === "completed" && (
                  <div className="flex space-x-2">
                    <Button onClick={() => handleDownload(selectedReport)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default ReportsPage
