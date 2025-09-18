// components/pages/MechanicDetailPage.tsx
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DynamicTable } from "@/components/ui/dynamic-table"
import { DynamicForm } from "@/components/ui/dynamic-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import type { MechanicDetail, FormField } from "@/lib/types"
import { toast } from "sonner"
import { ArrowLeft, Edit, CheckCircle, XCircle, Mail, Phone, MapPin, Star, Wrench, Calendar } from "lucide-react"

export default function MechanicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const mechanicId = params.id as string

  const { data, isLoading, isError } = useQuery({
    queryKey: ["mechanics", mechanicId],
    queryFn: () => api.get<MechanicDetail>(`/mechanics/${mechanicId}`),
  })
  const mechanic = data?.data;

  const updateMechanicMutation = useMutation({
    mutationFn: (formData: any) => {
      // Re-structure data if needed before sending to API
      const payload = { ...formData };
      if (typeof payload.specializations === 'string') {
        payload.specializations = payload.specializations.split(',').map((s: string) => s.trim());
      }
      return api.patch(`/mechanics/${mechanicId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics", mechanicId] })
      toast.success("Mechanic updated successfully")
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(`Failed to update mechanic. ${error || "Please try again."}`)
    },
  })

  const verifyMechanicMutation = useMutation({
    mutationFn: () => api.post(`/mechanics/${mechanicId}/verify`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics", mechanicId] })
      toast.success("Mechanic verified successfully")
    },
    onError: () => {
      toast.error("Failed to verify mechanic.")
    },
  })

  // The fields for the dynamic form
  const mechanicFormFields: FormField[] = [
    { name: "first_name", label: "First Name", type: "text", required: true },
    { name: "last_name", label: "Last Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text", required: false },
    { name: "specializations", label: "Specializations (comma-separated)", type: "text", required: false },
    { name: "experience_years", label: "Years of Experience", type: "number", required: false },
    { name: "hourly_rate", label: "Hourly Rate", type: "number", required: false },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending Verification" },
      ],
    },
  ]

  const serviceColumns = [
    { key: "id", label: "Service ID" },
    { key: "customer_name", label: "Customer" },
    { key: "service_type", label: "Service Type" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <Badge variant={value === "completed" ? "default" : "secondary"}>{value}</Badge>,
    },
    { key: "created_at", label: "Date" },
    { key: "total_amount", label: "Amount", render: (value: number) => `$${value}` },
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError || !mechanic) {
    return <div>Error: Mechanic not found or an error occurred.</div>
  }

  // Pre-process initial data for the form
  const initialData = {
    ...mechanic,
    specializations: Array.isArray(mechanic.specializations) ? mechanic.specializations.join(', ') : mechanic.specializations,
  };

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
          {mechanic.status === "pending" && (
            <Button
              variant="outline"
              onClick={() => verifyMechanicMutation.mutate()}
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
                <AvatarImage src={mechanic.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {mechanic.first_name?.[0]}
                  {mechanic.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {mechanic.first_name} {mechanic.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">ID: {mechanic.id}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mechanic.email}</span>
                {mechanic.email_verified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              {mechanic.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mechanic.phone}</span>
                </div>
              )}
              {mechanic.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mechanic.location}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={mechanic.status === "active" ? "default" : "secondary"}>{mechanic.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{mechanic.rating || 0}/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Experience</span>
                <span className="text-sm text-muted-foreground">{mechanic.experience_years || 0} years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hourly Rate</span>
                <span className="text-sm text-muted-foreground">${mechanic.hourly_rate || 0}/hr</span>
              </div>
            </div>

            {mechanic.specializations && (
              <div>
                <span className="text-sm font-medium">Specializations</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {Array.isArray(mechanic.specializations) ? mechanic.specializations.join(', ') : mechanic.specializations}
                </p>
              </div>
            )}

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
                  <DynamicTable
                    data={mechanic.services || []}
                    columns={serviceColumns as any}
                    title=""
                  />
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
                  <div className="space-y-4">
                    {(mechanic.reviews || []).map((review: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.customer_name}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
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
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <h4 className="font-medium">Working Hours</h4>
                      <div className="text-sm text-muted-foreground">
                        {/* This is placeholder data, replace with dynamic data from your API if available */}
                        Monday - Friday: 8:00 AM - 6:00 PM
                        <br />
                        Saturday: 9:00 AM - 4:00 PM
                        <br />
                        Sunday: Closed
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <h4 className="font-medium">Upcoming Appointments</h4>
                      <div className="space-y-2">
                        {(mechanic.upcoming_appointments || []).map((appointment: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="text-sm font-medium">{appointment.service_type}</span>
                              <p className="text-xs text-muted-foreground">{appointment.customer_name}</p>
                            </div>
                            <span className="text-sm">{appointment.scheduled_time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
            onSubmit={(data) => updateMechanicMutation.mutate(data)}
            onCancel={() => setIsEditing(false)}
            loading={updateMechanicMutation.isPending}
            title="Edit Mechanic"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}