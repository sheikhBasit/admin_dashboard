"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DynamicTable } from "@/components/ui/dynamic-table"
import { DynamicForm } from "@/components/ui/dynamic-form"
import { Car, Calendar, Gauge, Plus } from "lucide-react"
import type { Vehicle, TableColumn, FormField } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useApi } from "@/hooks/use-api"

import { toast } from "sonner"

const vehicleColumns: TableColumn<Vehicle>[] = [
  { key: "_id", label: "ID" },
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "year", label: "Year" },
  { key: "type", label: "Type" },
  { key: "fuel_type", label: "Fuel" },
  { key: "mileage_km", label: "Mileage (km)" },
  { 
    key: "is_active", 
    label: "Active", 
    render: (value: boolean) => <Badge variant={value ? "default" : "destructive"}>{value ? "Yes" : "No"}</Badge>
  },
  { 
    key: "owner", 
    label: "Owner", 
    render: (value, item) => item.owner ? `${item.owner.first_name} ${item.owner.last_name}` : "N/A" 
  },
  { key: "created_at", label: "Created At" },
];

const vehicleFormFields: FormField[] = [
  { name: "brand", label: "Brand", type: "text", required: false },
  { name: "model", label: "Model", type: "text", required: true },
  { name: "year", label: "Year", type: "number", required: false },
  { name: "type", label: "Type", type: "select", required: true, options: [
    { value: "car", label: "Car" },
    { value: "bike", label: "Bike" },
    { value: "truck", label: "Truck" },
    { value: "van", label: "Van" },
    { value: "suv", label: "SUV" },
    { value: "bus", label: "Bus" },
    { value: "other", label: "Other" },
  ] },
  { name: "fuel_type", label: "Fuel Type", type: "select", required: false, options: [
    { value: "petrol", label: "Petrol" },
    { value: "diesel", label: "Diesel" },
    { value: "electric", label: "Electric" },
    { value: "hybrid", label: "Hybrid" },
    { value: "cng", label: "CNG" },
    { value: "lpg", label: "LPG" },
    { value: "hydrogen", label: "Hydrogen" },
    { value: "other", label: "Other" },
  ] },
  { name: "transmission", label: "Transmission", type: "select", required: false, options: [
    { value: "manual", label: "Manual" },
    { value: "automatic", label: "Automatic" },
    { value: "semi_automatic", label: "Semi-Automatic" },
    { value: "cvt", label: "CVT" },
    { value: "dual_clutch", label: "Dual Clutch" },
    { value: "other", label: "Other" },
  ] },
  { name: "mileage_km", label: "Current Mileage (km)", type: "number", required: true },
  { name: "is_primary", label: "Primary", type: "checkbox", required: false },
  { name: "is_active", label: "Active", type: "checkbox", required: false },
  { name: "registration_number", label: "Registration Number", type: "text", required: false },
];

export default function VehiclesPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const queryClient = useQueryClient()
  const [isViewOpen, setIsViewOpen] = useState(false)

  // React Query logic only
  const { data: vehiclesResp, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<Vehicle[]>("/vehicles/admin/all"),
  })
  const vehicles: Vehicle[] = vehiclesResp?.data || []

  const createMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => api.post("/vehicles/admin", data),
    onSuccess: () => {
      toast.success("Vehicle created successfully");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setIsFormOpen(false);
    },
    onError: () => toast.error("Failed to create vehicle"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => api.put(`/vehicles/admin/${selectedVehicle?._id}`, data),
    onSuccess: () => {
      toast.success("Vehicle updated successfully");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setIsFormOpen(false);
      setSelectedVehicle(null);
    },
    onError: () => toast.error("Failed to update vehicle"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/admin/${id}`),
    onSuccess: () => {
      toast.success("Vehicle deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: () => toast.error("Failed to delete vehicle"),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Year</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vehicles?.length
                  ? Math.round(vehicles.reduce((acc, v) => acc + (v.year || 0), 0) / vehicles.length)
                  : "0"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => { setSelectedVehicle(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Vehicle
          </Button>
        </div>

        <DynamicTable
          title="Vehicles"
          data={vehicles}
          columns={vehicleColumns}
          loading={isLoading}
          onEdit={(item) => { setSelectedVehicle(item); setIsFormOpen(true); }}
          onDelete={(item) => deleteMutation.mutate(item._id)}
        />

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
              <DialogDescription>
                {selectedVehicle ? "Update vehicle information." : "Register a new vehicle."}
              </DialogDescription>
            </DialogHeader>
            <DynamicForm
                title={selectedVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                fields={vehicleFormFields}
                initialData={selectedVehicle || {}}
                onSubmit={(data) => {
                  if (selectedVehicle) updateMutation.mutate(data);
                  else createMutation.mutate(data);
                }}
                onCancel={() => { setIsFormOpen(false); setSelectedVehicle(null); }}
                loading={createMutation.isPending || updateMutation.isPending}
              />
          </DialogContent>
        </Dialog>

        {/* Vehicle Details View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vehicle Details</DialogTitle>
            </DialogHeader>
            {selectedVehicle && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedVehicle?.year} {selectedVehicle?.brand} {selectedVehicle?.model}
                    </h3>
                    <p className="text-muted-foreground">Registration: {selectedVehicle?.registration_number}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Gauge className="h-4 w-4 mr-1" />
                      {selectedVehicle?.mileage_km?.toLocaleString()} km
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Vehicle Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Brand:</strong> {selectedVehicle?.brand}
                      </p>
                      <p>
                        <strong>Model:</strong> {selectedVehicle?.model}
                      </p>
                      <p>
                        <strong>Year:</strong> {selectedVehicle?.year}
                      </p>
                      <p>
                        <strong>Type:</strong> {selectedVehicle?.type}
                      </p>
                      <p>
                        <strong>Fuel Type:</strong> {selectedVehicle?.fuel_type}
                      </p>
                      <p>
                        <strong>Transmission:</strong> {selectedVehicle?.transmission}
                      </p>
                      <p>
                        <strong>Mileage (km):</strong> {selectedVehicle?.mileage_km}
                      </p>
                      <p>
                        <strong>Registration:</strong> {selectedVehicle?.registration_number}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Owner Information</h4>
                    <div className="space-y-1 text-sm">
                      {selectedVehicle?.owner ? (
                        <>
                          <p>
                            <strong>Name:</strong> {selectedVehicle?.owner?.first_name} {selectedVehicle?.owner?.last_name}
                          </p>
                          <p>
                            <strong>Email:</strong> {selectedVehicle?.owner?.email}
                          </p>
                          {selectedVehicle?.owner?.phone_number && (
                            <p>
                              <strong>Phone:</strong> {selectedVehicle?.owner?.phone_number}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>No owner info</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
