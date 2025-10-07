"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Feedback } from "@/lib/types"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Trash2, Edit, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Helper to get badge variant based on status
const getStatusBadgeVariant = (status: Feedback["status"]) => {
  switch (status) {
    case "resolved":
      return "default"
    case "reviewed":
      return "secondary"
    case "flagged":
      return "destructive"
    case "deleted":
      return "destructive"
    case "hidden":
      return "outline"
    default:
      return "default"
  }
}

export default function FeedbackPage() {
  const queryClient = useQueryClient()
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [isViewModalOpen, setViewModalOpen] = useState(false)

  const { data: feedbackResponse, isLoading } = useQuery({
    queryKey: ["feedback", "all"],
    queryFn: () => api.get<Feedback[]>("/feedback/admin/all"),
  })
  const feedbacks = feedbackResponse || []

  const deleteMutation = useMutation({
    mutationFn: (feedbackId: string) => api.delete(`/feedback/${feedbackId}`),
    onSuccess: () => {
      toast.success("Feedback deleted successfully.")
      queryClient.invalidateQueries({ queryKey: ["feedback", "all"] })
    },
    onError: (error) => {
      toast.error("Failed to delete feedback.", {
        description: error.message,
      })
    },
  })

  const handleViewDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setViewModalOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>All Feedback</CardTitle>
            <CardDescription>
              Browse and manage all user-submitted feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading feedback...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Mechanic</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback._id}>
                      <TableCell className="font-medium truncate max-w-xs">
                        {feedback.user_id}
                      </TableCell>
                      <TableCell className="truncate max-w-xs">
                        {feedback.mechanic_id}
                      </TableCell>
                      <TableCell>{feedback.rating || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(feedback.status)}>
                          {feedback.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{feedback.title || "No Title"}</TableCell>
                      <TableCell>{formatDate(feedback.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(feedback)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!feedback.is_editable}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteMutation.mutate(feedback._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Full details for the selected feedback.
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-semibold">ID</span>
                <span className="col-span-3 truncate">{selectedFeedback._id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-semibold">User ID</span>
                <span className="col-span-3 truncate">{selectedFeedback.user_id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-semibold">Mechanic ID</span>
                <span className="col-span-3 truncate">{selectedFeedback.mechanic_id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-semibold">Rating</span>
                <span className="col-span-3">{selectedFeedback.rating || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-semibold">Status</span>
                <Badge variant={getStatusBadgeVariant(selectedFeedback.status)} className="col-span-3 w-fit">
                  {selectedFeedback.status}
                </Badge>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-semibold">Title</span>
                <span className="col-span-3">{selectedFeedback.title || "No Title"}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-right font-semibold pt-1">Description</span>
                <p className="col-span-3 text-sm text-muted-foreground">
                  {selectedFeedback.description || "No description provided."}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-semibold">Created</span>
                <span className="col-span-3">{formatDate(selectedFeedback.created_at)}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-semibold">Age (Days)</span>
                <span className="col-span-3">{selectedFeedback.age_days.toFixed(1)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
