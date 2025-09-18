
"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DynamicTable } from "@/components/ui/dynamic-table"
import { api } from "@/lib/api"
import { ArrowLeft, Car, User, Wrench, Calendar, FileText } from "lucide-react"
import type { Vehicle } from "@/lib/types"

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()

  const vehicleId = params.id as string

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicles", vehicleId],
    queryFn: () => api.get(`/admin/vehicles/${vehicleId}`),
  })

  // Define a type for service history if available, else use any
  type ServiceHistory = {
    id: string;
    service_type?: string;
    mechanic_name?: string;
    status?: string;
    date?: string;
    cost?: number;
  };
  const serviceColumns = [
    { key: "id", label: "Service ID" },
    { key: "service_type", label: "Service Type" },
    { key: "mechanic_name", label: "Mechanic" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <Badge variant={value === "completed" ? "default" : "secondary"}>{value}</Badge>,
    },
    { key: "date", label: "Date" },
    { key: "cost", label: "Cost", render: (value: number) => `$${value}` },
  ] as const;

  if (isLoading) {
    return <div>Loading...</div>
  }


  if (!vehicle || !vehicle.data) {
    return <div>Vehicle not found</div>
  }

  const v = vehicle.data as Vehicle;
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
            {v.year} {v.brand} {v.model}
          </p>
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
                  {v.year} {v.brand} {v.model}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Registration Number</span>
                <p className="text-sm text-muted-foreground">{v.registration_number || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Mileage (km)</span>
                <p className="text-sm text-muted-foreground">{v.mileage_km?.toLocaleString() ?? "Not recorded"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Type</span>
                <p className="text-sm text-muted-foreground">{v.type}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Fuel Type</span>
                <p className="text-sm text-muted-foreground">{v.fuel_type || "Not specified"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Transmission</span>
                <p className="text-sm text-muted-foreground">{v.transmission || "Not specified"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Primary</span>
                <p className="text-sm text-muted-foreground">{v.is_primary ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Active</span>
                <p className="text-sm text-muted-foreground">{v.is_active ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Registered</span>
                <p className="text-sm text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</p>
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
                  {v.owner ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={v.owner.profile_picture || "/placeholder.svg"} />
                          <AvatarFallback>
                            {v.owner.first_name?.[0]}
                            {v.owner.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {v.owner.first_name} {v.owner.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{v.owner.email}</p>
                          {v.owner.phone_number && (
                            <p className="text-sm text-muted-foreground">{v.owner.phone_number}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => router.push(`/users/${v.owner?.id}`)}>
                        View Owner Profile
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No owner information available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/*
            <TabsContent value="maintenance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Maintenance Schedule
                  </CardTitle>
                  <CardDescription>Upcoming and overdue maintenance items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Overdue</h4>
                      <div className="space-y-2">
                        {(v.overdue_maintenance || []).map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border border-red-200 rounded"
                          >
                            <div>
                              <span className="text-sm font-medium">{item.service_type}</span>
                              <p className="text-xs text-muted-foreground">
                                Due at {item.due_mileage?.toLocaleString()} miles
                              </p>
                            </div>
                            <Badge variant="destructive">Overdue</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-yellow-600 mb-2">Upcoming</h4>
                      <div className="space-y-2">
                        {(v.upcoming_maintenance || []).map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border border-yellow-200 rounded"
                          >
                            <div>
                              <span className="text-sm font-medium">{item.service_type}</span>
                              <p className="text-xs text-muted-foreground">
                                Due at {item.due_mileage?.toLocaleString()} miles
                              </p>
                            </div>
                            <Badge variant="secondary">Due Soon</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Vehicle Documents
                  </CardTitle>
                  <CardDescription>Registration, insurance, and other documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(v.documents || []).map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="text-sm font-medium">{doc.type}</span>
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={new Date(doc.expiry_date) < new Date() ? "destructive" : "default"}>
                            {new Date(doc.expiry_date) < new Date() ? "Expired" : "Valid"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            */}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
