"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DynamicTable } from "@/components/ui/dynamic-table"
import { DynamicForm } from "@/components/ui/dynamic-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Mechanic, TableColumn, FormField } from "@/lib/types"
import { Plus, Edit, Trash2, Star, MapPin, Phone, Mail } from "lucide-react"

import { api } from "@/lib/api"
import { toast } from "sonner"

const mechanicColumns: TableColumn<Mechanic>[] = [
  { 
    key: "profile_picture", 
    label: "Profile", 
    render: (value, row) => (
      <Avatar>
        <AvatarImage src={value as string} alt={`${row.first_name} ${row.last_name}`} />
        <AvatarFallback>{`${row.first_name[0]}${row.last_name[0]}`}</AvatarFallback>
      </Avatar>
    )
  },
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Phone Number" },
  { key: "cnic", label: "CNIC" },
  { key: "province", label: "Province" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "latitude", label: "Latitude" },
  { key: "longitude", label: "Longitude" },
  { key: "expertise", label: "Expertise", render: (value) => Array.isArray(value) ? value.join(", ") : value },
  { key: "years_of_experience", label: "Experience (years)" },
  { key: "workshop_name", label: "Workshop Name" },
  { key: "working_days", label: "Working Days", render: (value) => Array.isArray(value) ? value.join(", ") : value },
  { key: "working_hours", label: "Working Hours", render: (value: any) => value ? `${value.start_time} - ${value.end_time}` : 'N/A' },
]

const mechanicFormFields: FormField[] = [
  { name: "first_name", label: "First Name", type: "text", required: true },
  { name: "last_name", label: "Last Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: false },
  { name: "phone_number", label: "Phone Number", type: "text", required: true },
  { name: "cnic", label: "CNIC", type: "text", required: true },
  { name: "province", label: "Province", type: "text", required: true },
  { name: "city", label: "City", type: "text", required: true },
  { name: "address", label: "Address", type: "text", required: true },
  { name: "latitude", label: "Latitude", type: "number", required: true },
  { name: "longitude", label: "Longitude", type: "number", required: true },
  { name: "expertise", label: "Expertise", type: "text", required: true },
  { name: "years_of_experience", label: "Years of Experience", type: "number", required: true },
  { name: "profile_picture", label: "Profile Picture", type: "text", required: false },
  { name: "cnic_front", label: "CNIC Front", type: "text", required: false },
  { name: "cnic_back", label: "CNIC Back", type: "text", required: false },
  { name: "workshop_name", label: "Workshop Name", type: "text", required: false },
  { name: "working_days", label: "Working Days", type: "text", required: false },
  // These fields are temporary for form input; their values will be grouped.
  { name: "working_hours.start_time", label: "Start Time", type: "text", required: false },
  { name: "working_hours.end_time", label: "End Time", type: "text", required: false },
]

export default function MechanicsPage() {
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data: mechanicsResp, isLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: () => api.get<Mechanic[]>("/mechanics"),
  })
  const mechanics: Mechanic[] = mechanicsResp?.data || []

  const createMechanicMutation = useMutation({
    mutationFn: (data: Partial<Mechanic>) => api.post(`/mechanics`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      setIsFormOpen(false)
      toast.success("Mechanic created successfully!")
    },
    onError: () => {
      toast.error("Failed to create mechanic. Please check your inputs.")
    },
  })

  const updateMechanicMutation = useMutation({
    mutationFn: (mechanic: Mechanic) => api.patch(`/mechanics/${mechanic.id}`, mechanic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      setIsFormOpen(false)
      setSelectedMechanic(null)
      toast.success("Mechanic updated successfully!")
    },
    onError: () => {
      toast.error("Failed to update mechanic. Please check your inputs.")
    },
  })

  const deleteMechanicMutation = useMutation({
    mutationFn: (mechanicId: string) => api.delete(`/mechanics/${mechanicId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      toast.success("Mechanic deleted successfully!")
    },
    onError: () => {
      toast.error("Failed to delete mechanic.")
    },
  })

  // The key change is here to format the data correctly
  const handleFormSubmit = (data: Record<string, any>) => {
    // Extract working hours and format them into a nested object
    const payload = { ...data };
    if (payload['working_hours.start_time'] && payload['working_hours.end_time']) {
        payload.working_hours = {
            start_time: payload['working_hours.start_time'],
            end_time: payload['working_hours.end_time']
        };
    }
    delete payload['working_hours.start_time'];
    delete payload['working_hours.end_time'];
    
    // Convert expertise and working_days from string to array if necessary
    if (typeof payload.expertise === 'string') {
        payload.expertise = payload.expertise.split(',').map((item: string) => item.trim());
    }
    if (typeof payload.working_days === 'string') {
        payload.working_days = payload.working_days.split(',').map((item: string) => item.trim());
    }

    if (selectedMechanic) {
      updateMechanicMutation.mutate({ ...selectedMechanic, ...payload });
    } else {
      createMechanicMutation.mutate(payload);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedMechanic(null)
  }

  const handleEdit = (mechanic: Mechanic) => {
    // Flatten the working_hours object for the DynamicForm's initial data
    const flattenedData = {
      ...mechanic,
      'working_hours.start_time': mechanic.working_hours?.start_time,
      'working_hours.end_time': mechanic.working_hours?.end_time,
    };
    setSelectedMechanic(flattenedData as Mechanic);
    setIsFormOpen(true);
  };

  const handleDelete = (mechanic: Mechanic) => {
    if (confirm(`Are you sure you want to delete ${mechanic.first_name} ${mechanic.last_name}?`)) {
      deleteMechanicMutation.mutate(mechanic.id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "inactive":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mechanics Management</h1>
            <p className="text-muted-foreground">Manage your team of mechanics and their specializations</p>
          </div>
          <Button onClick={() => { setSelectedMechanic(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mechanic
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedMechanic ? "Edit Mechanic" : "Add New Mechanic"}</DialogTitle>
                <DialogDescription>
                  {selectedMechanic ? "Update mechanic information" : "Add a new mechanic to your team"}
                </DialogDescription>
              </DialogHeader>
              <DynamicForm
                fields={mechanicFormFields}
                initialData={selectedMechanic || {}}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                title={selectedMechanic ? "Edit Mechanic" : "Add New Mechanic"}
                loading={createMechanicMutation.isPending || updateMechanicMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mechanics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mechanics.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mechanics.filter((m: Mechanic) => m.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mechanics.filter((m: Mechanic) => m.is_verified).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mechanics.length
                  ? (mechanics.reduce((acc: number, m: Mechanic) => acc + (m.rating || 0), 0) / mechanics.length).toFixed(1)
                  : "0.0"}
              </div>
            </CardContent>
          </Card>
        </div>

        <DynamicTable
          data={mechanics}
          columns={mechanicColumns as any}
          title="Mechanics"
          loading={isLoading}
          searchable
          filterable
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Mechanic Detail View */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Mechanic Details</DialogTitle>
            </DialogHeader>
            {selectedMechanic && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedMechanic.profile_picture} alt={`${selectedMechanic.first_name} ${selectedMechanic.last_name}`} />
                    <AvatarFallback className="text-lg">{`${selectedMechanic.first_name[0]}${selectedMechanic.last_name[0]}`}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedMechanic.first_name} {selectedMechanic.last_name} </h3>
                    <p className="text-muted-foreground">{selectedMechanic.specialization}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">{selectedMechanic.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedMechanic.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedMechanic.phone_number}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Experience:</strong> {selectedMechanic.years_of_experience} years
                    </p>
                    <p className="text-sm">
                      <strong>Verified:</strong> {selectedMechanic.is_verified ? "Yes" : "No"}
                    </p>
                    <p className="text-sm">
                      <strong>Active:</strong> {selectedMechanic.is_active ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}