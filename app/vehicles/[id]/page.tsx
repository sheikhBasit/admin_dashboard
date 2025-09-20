"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DynamicForm } from "@/components/ui/dynamic-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import type { Vehicle, FormField } from "@/lib/types"
import { toast } from "sonner"
import { ArrowLeft, Car, User, Edit, Trash2 } from "lucide-react"

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const vehicleId = params.id as string

  const { data: vehicleResp, isLoading } = useQuery({
    queryKey: ["vehicles", vehicleId],
    queryFn: () => api.get<Vehicle>(`/vehicles/admin/${vehicleId}`),
  })
  const vehicle = vehicleResp?.data

  const updateVehicleMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => api.put(`/vehicles/${vehicleId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", vehicleId] })
      toast.success("Vehicle updated successfully")
      setIsEditing(false)
    },
  })

  const deleteVehicleMutation = useMutation({
    mutationFn: () => api.delete(`/vehicles/${vehicleId}`),
    onSuccess: () => {
      toast.success("Vehicle deleted successfully")
      router.push("/vehicles")
    },
  })

  const vehicleFormFields: FormField[] = [
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

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Details</h1>
          <p className="text-muted-foreground">
            {vehicle.year} {vehicle.brand} {vehicle.model}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteVehicleMutation.mutate()}
            disabled={deleteVehicleMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Make & Model</span>
                <p className="text-sm text-muted-foreground">
                  {vehicle.year} {vehicle.brand} {vehicle.model}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Registration Number</span>
                <p className="text-sm text-muted-foreground">{vehicle.registration_number || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Mileage (km)</span>
                <p className="text-sm text-muted-foreground">{vehicle.mileage_km?.toLocaleString() ?? "Not recorded"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Type</span>
                <p className="text-sm text-muted-foreground">{vehicle.type}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Fuel Type</span>
                <p className="text-sm text-muted-foreground">{vehicle.fuel_type || "Not specified"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Transmission</span>
                <p className="text-sm text-muted-foreground">{vehicle.transmission || "Not specified"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Primary</span>
                <p className="text-sm text-muted-foreground">{vehicle.is_primary ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Active</span>
                <p className="text-sm text-muted-foreground">{vehicle.is_active ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Registered</span>
                <p className="text-sm text-muted-foreground">{new Date(vehicle.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="owner" className="space-y-4">
            <TabsList>
              <TabsTrigger value="owner">Owner</TabsTrigger>
            </TabsList>

            <TabsContent value="owner">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Vehicle Owner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vehicle.owner ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={vehicle.owner.profile_picture || "/placeholder.svg"} />
                          <AvatarFallback>
                            {vehicle.owner.first_name?.[0]}
                            {vehicle.owner.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {vehicle.owner.first_name} {vehicle.owner.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{vehicle.owner.email}</p>
                          {vehicle.owner.phone_number && (
                            <p className="text-sm text-muted-foreground">{vehicle.owner.phone_number}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => router.push(`/users/${vehicle.owner?.id}`)}>
                        View Owner Profile
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No owner information available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Update vehicle information.</DialogDescription>
          </DialogHeader>
          <DynamicForm
            fields={vehicleFormFields}
            initialData={vehicle}
            onSubmit={(data) => updateVehicleMutation.mutate(data)}
            onCancel={() => setIsEditing(false)}
            loading={updateVehicleMutation.isPending}
            title="Edit Vehicle"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
