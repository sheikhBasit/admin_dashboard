// Strictly match backend MechanicService model
type MechanicService = {
  id: string;
  user_id: string;
  mechanic_id: string;
  vehicle_id: string;
  issue_description: string;
  service_type: string;
  service_cost?: number;
  region?: string;
  estimated_time?: string;
  status: string;
  images: string[];
  user?: any;
  mechanic?: any;
  vehicle?: any;
};
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DynamicForm } from "@/components/ui/dynamic-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Edit } from "lucide-react"

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const serviceId = params.id as string

  const { data: service, isLoading } = useQuery<MechanicService>({
    queryKey: ["mechanic-services", serviceId],
  queryFn: () => api.get(`/mechanic-services/${serviceId}`).then(res => res.data as MechanicService),
  })

  const updateServiceMutation = useMutation({
    mutationFn: (data: any) => api.put(`/mechanic-services/${serviceId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanic-services", serviceId] });
      toast.success("Service updated successfully");
      setIsEditing(false)
    },
  })

  const serviceFormFields = [
    { name: "user_id", label: "User ID", type: "text" as const, required: true },
    { name: "mechanic_id", label: "Mechanic ID", type: "text" as const, required: true },
    { name: "vehicle_id", label: "Vehicle ID", type: "text" as const, required: true },
    { name: "issue_description", label: "Issue Description", type: "textarea" as const, required: true },
    {
      name: "service_type",
      label: "Service Type",
      type: "select" as const,
      required: true,
      options: [
        { value: "repair", label: "Repair" },
        { value: "maintenance", label: "Maintenance" },
        { value: "diagnostic", label: "Diagnostic" },
        { value: "inspection", label: "Inspection" },
        { value: "emergency", label: "Emergency" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "service_cost", label: "Service Cost", type: "number" as const },
    { name: "region", label: "Region", type: "text" as const },
    { name: "estimated_time", label: "Estimated Time", type: "text" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      options: [
        { value: "pending", label: "Pending" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!service) {
    return <div>Service not found</div>
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Service Request Details</h1>
          <p className="text-muted-foreground">Service ID: {service.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium">Service ID</span>
              <p className="text-sm text-muted-foreground">{service.id}</p>
            </div>
            <div>
              <span className="text-sm font-medium">User ID</span>
              <p className="text-sm text-muted-foreground">{service.user_id}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Mechanic ID</span>
              <p className="text-sm text-muted-foreground">{service.mechanic_id}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Vehicle ID</span>
              <p className="text-sm text-muted-foreground">{service.vehicle_id}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Issue Description</span>
              <p className="text-sm text-muted-foreground">{service.issue_description}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Service Type</span>
              <p className="text-sm text-muted-foreground">{service.service_type}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Service Cost</span>
              <p className="text-sm text-muted-foreground">{service.service_cost ?? '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Region</span>
              <p className="text-sm text-muted-foreground">{service.region ?? '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Estimated Time</span>
              <p className="text-sm text-muted-foreground">{service.estimated_time ?? '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Status</span>
              <Badge variant="secondary">{service.status}</Badge>
            </div>
          </div>
          {service.images && service.images.length > 0 && (
            <div>
              <span className="text-sm font-medium">Images</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {service.images.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt="Service" className="w-20 h-20 object-cover rounded" />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service information.</DialogDescription>
          </DialogHeader>
          <DynamicForm
            fields={serviceFormFields}
            initialData={service}
            onSubmit={(data) => updateServiceMutation.mutate(data)}
            onCancel={() => setIsEditing(false)}
            loading={updateServiceMutation.isPending}
            title="Edit Service"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
