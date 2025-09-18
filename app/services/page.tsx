"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DynamicTable } from "@/components/ui/dynamic-table"
import { DynamicForm } from "@/components/ui/dynamic-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Service, TableColumn, FormField } from "@/lib/types"
import { Plus } from "lucide-react"
import { toast } from "sonner"

const serviceColumns: TableColumn<Service>[] = [
  { key: "id", label: "ID" },
  { key: "user_id", label: "User ID" },
  { key: "mechanic_id", label: "Mechanic ID" },
  { key: "vehicle_id", label: "Vehicle ID" },
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "created_at", label: "Created At" },
  { key: "updated_at", label: "Updated At" },
  { key: "completed_at", label: "Completed At" },
]

const serviceFormFields: FormField[] = [
  { name: "user_id", label: "User ID", type: "text", required: true },
  { name: "mechanic_id", label: "Mechanic ID", type: "text", required: false },
  { name: "vehicle_id", label: "Vehicle ID", type: "text", required: true },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "status", label: "Status", type: "select", required: true, options: [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ] },
  { name: "priority", label: "Priority", type: "select", required: true, options: [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ] },
]

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch all services
  const { data: servicesResp, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => api.get<Service[]>("/mechanic-services/admin/all"),
  })
  const services: Service[] = servicesResp?.data || []

  // Create service
  const createMutation = useMutation({
    mutationFn: (data: Partial<Service>) => api.post("/mechanic-services", data),
    onSuccess: () => {
      toast.success("Service created successfully")
  queryClient.invalidateQueries({ queryKey: ["services"] })
      setIsFormOpen(false)
    },
    onError: () => toast.error("Failed to create service"),
  })

  // Update service
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Service>) => api.put(`/mechanic-services/${selectedService?.id}`, data),
    onSuccess: () => {
      toast.success("Service updated successfully")
  queryClient.invalidateQueries({ queryKey: ["services"] })
      setIsFormOpen(false)
      setSelectedService(null)
    },
    onError: () => toast.error("Failed to update service"),
  })

  // Delete service
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/mechanic-services/${id}`),
    onSuccess: () => {
      toast.success("Service deleted successfully")
  queryClient.invalidateQueries({ queryKey: ["services"] })
    },
    onError: () => toast.error("Failed to delete service"),
  })
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <Button onClick={() => { setSelectedService(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Service
          </Button>
        </div>

        <DynamicTable
          title="Services"
          data={services}
          columns={serviceColumns}
          loading={isLoading}
          onEdit={service => { setSelectedService(service); setIsFormOpen(true); }}
          onDelete={service => deleteMutation.mutate(service.id)}
        />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedService ? "Edit Service" : "Add New Service"}</DialogTitle>
              <DialogDescription>
                {selectedService ? "Update service information" : "Add a new service to your offerings"}
              </DialogDescription>
            </DialogHeader>
            <DynamicForm
              title="Service Form"
              fields={serviceFormFields}
              initialData={selectedService || {}}
              onSubmit={data => {
                if (selectedService) updateMutation.mutate(data)
                else createMutation.mutate(data)
              }}
              onCancel={() => { setIsFormOpen(false); setSelectedService(null); }}
              loading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Service Details</DialogTitle>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">Service ID: {selectedService.id}</h3>
                    <p className="text-muted-foreground">User: {selectedService.user_id}</p>
                    <p className="text-muted-foreground">Mechanic: {selectedService.mechanic_id || '-'}</p>
                    <p className="text-muted-foreground">Vehicle: {selectedService.vehicle_id}</p>
                    <Badge variant="secondary">{selectedService.status}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Priority: {selectedService.priority}</div>
                    <div className="text-xs text-muted-foreground">Created: {selectedService.created_at}</div>
                    <div className="text-xs text-muted-foreground">Updated: {selectedService.updated_at}</div>
                    {selectedService.completed_at && (
                      <div className="text-xs text-muted-foreground">Completed: {selectedService.completed_at}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
