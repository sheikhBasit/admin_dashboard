"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DynamicTable } from "@/components/ui/dynamic-table"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { Vehicle, TableColumn, FormField } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const vehicleColumns: TableColumn<Vehicle>[] = [
  { key: "display_name", label: "Name", sortable: true },
  { 
    key: "owner", 
    label: "Owner", 
    render: (owner) => owner?.email || "N/A"
  },
  { key: "registration_number", label: "Registration" },
  {
    key: "is_active",
    label: "Status",
    render: (value: boolean) => (
      <Badge variant={value ? "default" : "destructive"}>{value ? "Active" : "Inactive"}</Badge>
    ),
  },
  {
    key: "created_at",
    label: "Created",
    sortable: true,
    render: (value: string) => formatDate(value),
  },
]

const vehicleFormFields: FormField[] = [
  { name: "user_id", label: "User ID", type: "text", required: true },
  { name: "model", label: "Model", type: "text", required: true },
  { name: "brand", label: "Brand", type: "text" },
  { name: "year", label: "Year", type: "number" },
  { name: "type", label: "Type", type: "text", required: true },
  { name: "fuel_type", label: "Fuel Type", type: "text" },
  { name: "transmission", label: "Transmission", type: "text" },
  { name: "registration_number", label: "Registration Number", type: "text" },
  { name: "mileage_km", label: "Mileage (km)", type: "number" },
  { name: "is_active", label: "Active", type: "checkbox" },
]

export default function VehiclesPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: vehiclesResp, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<Vehicle[]>("/vehicles/admin/all"),
  })
  const vehicles = vehiclesResp?.data || []

  const createVehicleMutation = useMutation({
    mutationFn: (vehicle: Partial<Vehicle>) => api.post(`/vehicles`, vehicle, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      setIsFormOpen(false)
      setSelectedVehicle(null)
    },
  })

  const updateVehicleMutation = useMutation({
    mutationFn: (vehicle: Vehicle) => api.put(`/vehicles/${vehicle._id}`, vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      setIsFormOpen(false)
      setSelectedVehicle(null)
    },
  })

  const deleteVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) => api.delete(`/vehicles/${vehicleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsFormOpen(true)
  }

  const handleDelete = (vehicle: Vehicle) => {
    if (confirm(`Are you sure you want to delete ${vehicle.display_name}?`)) {
      deleteVehicleMutation.mutate(vehicle._id)
    }
  }

  const handleFormSubmit = (data: Record<string, any>) => {
    const formData = new FormData()
    for (const key in data) {
      formData.append(key, data[key])
    }

    if (selectedVehicle) {
      updateVehicleMutation.mutate({ ...selectedVehicle, ...data })
    } else {
      createVehicleMutation.mutate(data)
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedVehicle(null)
  }

  return (
    <DashboardLayout>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
          <Button onClick={() => { setSelectedVehicle(null); setIsFormOpen(true); }}>
            Add Vehicle
          </Button>
        </div>

        <DynamicTable
          data={vehicles}
          columns={vehicleColumns}
          title="Vehicle Management"
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          idKey="_id"
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
              <DialogDescription>
                {selectedVehicle ? "Update vehicle information." : "Create a new vehicle."}
              </DialogDescription>
            </DialogHeader>
            <DynamicForm
              fields={vehicleFormFields}
              initialData={selectedVehicle || { is_active: true }}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              title={selectedVehicle ? "Edit Vehicle" : "Add Vehicle"}
              loading={createVehicleMutation.isPending || updateVehicleMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </main>
    </DashboardLayout>
  )
}
