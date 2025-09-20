"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
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
import { Plus, Star } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
// import * as z from "zod"; // Zod is no longer needed

const mechanicColumns: TableColumn<Mechanic>[] = [
  {
    key: "profile_picture",
    label: "Profile",
    render: (value, row) => (
      <Avatar>
        <AvatarImage src={value as string} alt={row.full_name} />
        <AvatarFallback>{`${row.first_name[0]}${row.last_name[0]}`}</AvatarFallback>
      </Avatar>
    ),
  },
  { key: "full_name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "phone_number", label: "Phone" },
  { key: "city", label: "City", sortable: true },
  {
    key: "is_verified",
    label: "Verified",
    render: (value: boolean) => (
      <Badge variant={value ? "default" : "secondary"}>{value ? "Verified" : "Unverified"}</Badge>
    ),
  },
  {
    key: "is_available",
    label: "Available",
    render: (value: boolean) => (
      <Badge variant={value ? "default" : "destructive"}>{value ? "Yes" : "No"}</Badge>
    ),
  },
  {
    key: "average_rating",
    label: "Rating",
    sortable: true,
    render: (value: number) => (
      <div className="flex items-center">
        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
        {value?.toFixed(1) || "N/A"}
      </div>
    ),
  },
]

const mechanicFormFields: FormField[] = [
  { name: "first_name", label: "First Name", type: "text", required: true },
  { name: "last_name", label: "Last Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email" },
  { 
    name: "phone_number", 
    label: "Phone Number", 
    type: "text", 
    required: true, 
    minLength: 11, 
    maxLength: 11,
    placeholder: "e.g., 03001234567"
  },
  { name: "province", label: "Province", type: "text", required: true },
  { name: "city", label: "City", type: "text", required: true },
  { 
    name: "cnic", 
    label: "CNIC", 
    type: "text", 
    required: true, 
    minLength: 13, 
    maxLength: 13,
    placeholder: "e.g., 3520212345671"
  },
  { name: "address", label: "Address", type: "text", required: true },
  { name: "latitude", label: "Latitude", type: "number", required: true },
  { name: "longitude", label: "Longitude", type: "number", required: true },
  { name: "expertise", label: "Expertise (comma-separated)", type: "text", required: true },
  { name: "years_of_experience", label: "Years of Experience", type: "number", required: true },
  { name: "workshop_name", label: "Workshop Name", type: "text" },
  { 
    name: "working_days", 
    label: "Working Days", 
    type: "select-multiple", 
    options: [
      { value: "monday", label: "Monday" },
      { value: "tuesday", label: "Tuesday" },
      { value: "wednesday", label: "Wednesday" },
      { value: "thursday", label: "Thursday" },
      { value: "friday", label: "Friday" },
      { value: "saturday", label: "Saturday" },
      { value: "sunday", label: "Sunday" },
    ]
  },
  { name: "start_time", label: "Start Time", type: "time" },
  { name: "end_time", label: "End Time", type: "time" },
  { name: "is_verified", label: "Verified", type: "checkbox" },
  { name: "is_available", label: "Available", type: "checkbox" },
];

export default function MechanicsPage() {
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: mechanicsResp, isLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: () => api.get<Mechanic[]>("/mechanics"),
  })
  const mechanics = mechanicsResp?.data || []

  const createMechanicMutation = useMutation({
    mutationFn: (formData: FormData) => api.post(`/mechanics/register`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      setIsFormOpen(false)
      toast.success("Mechanic created successfully!")
    },
    onError: (error) => {
      console.error("Creation error:", error);
      toast.error("Failed to create mechanic. Please check the form data.");
    }
  })

  const updateMechanicMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => api.patch(`/mechanics/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      setIsFormOpen(false)
      setSelectedMechanic(null)
      toast.success("Mechanic updated successfully!")
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Failed to update mechanic. Please check the form data.");
    }
  })

  const deleteMechanicMutation = useMutation({
    mutationFn: (mechanicId: string) => api.delete(`/mechanics/admin/${mechanicId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      toast.success("Mechanic deleted successfully!")
    },
  })

  const handleFormSubmit = (data: Record<string, any>) => {
    // No more Zod validation
    const isUpdating = !!selectedMechanic;
    const formData = new FormData();
    
    for (const key in data) {
      const value = data[key];
      if (value === null || value === undefined) {
        continue;
      }

      // Correctly append arrays and strings
      if (key === 'working_days' && Array.isArray(value)) {
          value.forEach(day => formData.append('working_days', day));
      } else if (key === 'expertise' && typeof value === 'string') {
          const items = value.split(',').map(item => item.trim()).filter(Boolean);
          items.forEach(item => formData.append('expertise', item));
      } else if (key === 'is_verified' || key === 'is_available') {
          formData.append(key, value ? 'true' : 'false');
      } else if (key === 'start_time' || key === 'end_time' || key === 'workshop_name' || key === 'email') {
          // Only append optional strings if they are not empty
          if (value !== '') {
              formData.append(key, value);
          }
      } else {
          formData.append(key, String(value));
      }
    }
    
    if (isUpdating && selectedMechanic) {
      updateMechanicMutation.mutate({ id: selectedMechanic._id, formData });
    } else {
      createMechanicMutation.mutate(formData);
    }
  };
  
  const handleEdit = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setIsFormOpen(true);
  };

  const handleDelete = (mechanic: Mechanic) => {
    if (confirm(`Are you sure you can delete ${mechanic.full_name}?`)) {
      deleteMechanicMutation.mutate(mechanic._id)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Mechanics</h2>
          <Button onClick={() => { setSelectedMechanic(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mechanic
          </Button>
        </div>

        <DynamicTable
          data={mechanics}
          columns={mechanicColumns}
          title="Mechanic Management"
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          idKey="_id"
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedMechanic ? "Edit Mechanic" : "Add Mechanic"}</DialogTitle>
              <DialogDescription>
                {selectedMechanic ? "Update mechanic information." : "Create a new mechanic."}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-4 -mr-4">
              <DynamicForm
                key={selectedMechanic?._id || 'new-mechanic'}
                fields={mechanicFormFields}
                initialData={
                  selectedMechanic
                    ? {
                        ...selectedMechanic,
                        latitude: selectedMechanic.location?.coordinates?.[1] ?? 0,
                        longitude: selectedMechanic.location?.coordinates?.[0] ?? 0,
                        working_days: selectedMechanic.working_days || [],
                        start_time: selectedMechanic.working_hours?.start_time || "",
                        end_time: selectedMechanic.working_hours?.end_time || "",
                        expertise: Array.isArray(selectedMechanic.expertise) ? selectedMechanic.expertise.join(", ") : "",
                      }
                    : { is_available: true, is_verified: false, working_days: [] }
                }
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedMechanic(null);
                }}
                title={selectedMechanic ? "Edit Mechanic" : "Add Mechanic"}
                loading={createMechanicMutation.isPending || updateMechanicMutation.isPending}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}