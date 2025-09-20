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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import type { Mechanic, FormField } from "@/lib/types"
import { toast } from "sonner"
import { ArrowLeft, Edit, Trash2, CheckCircle, Mail, Phone, MapPin, Star, Wrench, Calendar } from "lucide-react"

export default function MechanicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const mechanicId = params.id as string

  const { data: mechanicResp, isLoading } = useQuery({
    queryKey: ["mechanics", mechanicId],
    queryFn: () => api.get<Mechanic>(`/mechanics/${mechanicId}`),
  })
  const mechanic = mechanicResp?.data

  const updateMechanicMutation = useMutation({
    mutationFn: (formData: FormData) => api.patch(`/mechanics/${mechanicId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics", mechanicId] })
      toast.success("Mechanic updated successfully")
      setIsEditing(false)
    },
  })

  const deleteMechanicMutation = useMutation({
    mutationFn: () => api.delete(`/mechanics/admin/${mechanicId}`),
    onSuccess: () => {
      toast.success("Mechanic deleted successfully")
      router.push("/mechanics")
    },
  })

  const verifyMechanicMutation = useMutation({
    mutationFn: (verify: boolean) => api.post(`/mechanics/${mechanicId}/verify?verify=${verify}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics", mechanicId] })
      toast.success("Mechanic verification status updated")
    },
  })

  const mechanicFormFields: FormField[] = [
    { name: "first_name", label: "First Name", type: "text", required: true },
    { name: "last_name", label: "Last Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email" },
    { name: "phone_number", label: "Phone Number", type: "text", required: true },
    { name: "province", label: "Province", type: "text", required: true },
    { name: "city", label: "City", type: "text", required: true },
    { name: "address", label: "Address", type: "text", required: true },
    { name: "latitude", label: "Latitude", type: "number", required: true },
    { name: "longitude", label: "Longitude", type: "number", required: true },
    { name: "expertise", label: "Expertise (comma-separated)", type: "text", required: true },
    { name: "years_of_experience", label: "Years of Experience", type: "number", required: true },
    { name: "workshop_name", label: "Workshop Name", type: "text" },
    { name: "is_verified", label: "Verified", type: "checkbox" },
    { name: "is_available", label: "Available", type: "checkbox" },
  ]

  const handleFormSubmit = (data: Record<string, any>) => {
    const formData = new FormData()
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
    updateMechanicMutation.mutate(formData)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!mechanic) {
    return <div>Mechanic not found</div>
  }

  const initialData = {
    ...mechanic,
    expertise: Array.isArray(mechanic.expertise) ? mechanic.expertise.join(", ") : "",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Mechanic Details</h1>
          <p className="text-muted-foreground">Manage mechanic information and view service history</p>
        </div>
        <div className="flex gap-2">
          {!mechanic.is_verified && (
            <Button
              variant="outline"
              onClick={() => verifyMechanicMutation.mutate(true)}
              disabled={verifyMechanicMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify Mechanic
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMechanicMutation.mutate()}
            disabled={deleteMechanicMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mechanic.profile_picture || "/placeholder.svg"} />
                <AvatarFallback>
                  {mechanic.first_name?.[0]}
                  {mechanic.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{mechanic.full_name}</h3>
                <p className="text-sm text-muted-foreground">ID: {mechanic.id}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mechanic.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mechanic.phone_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mechanic.address}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={mechanic.is_available ? "default" : "secondary"}>
                  {mechanic.is_available ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{mechanic.average_rating?.toFixed(1) || "N/A"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Experience</span>
                <span className="text-sm text-muted-foreground">{mechanic.years_of_experience} years</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Expertise</span>
              <p className="text-sm text-muted-foreground mt-1">
                {Array.isArray(mechanic.expertise) ? mechanic.expertise.join(', ') : ""}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Joined</span>
              <span className="text-sm text-muted-foreground">
                {new Date(mechanic.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="services" className="space-y-4">
            <TabsList>
              <TabsTrigger value="services">Service History</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Service History
                  </CardTitle>
                  <CardDescription>All services performed by this mechanic</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Service History Coming Soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Customer Reviews
                  </CardTitle>
                  <CardDescription>Feedback from customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Customer Reviews Coming Soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule & Availability
                  </CardTitle>
                  <CardDescription>Current schedule and upcoming appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Schedule & Availability Coming Soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Mechanic Details</DialogTitle>
          </DialogHeader>
          <DynamicForm
            fields={mechanicFormFields}
            initialData={initialData}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsEditing(false)}
            loading={updateMechanicMutation.isPending}
            title="Edit Mechanic"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}