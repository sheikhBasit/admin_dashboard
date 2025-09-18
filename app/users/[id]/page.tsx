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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import type { UserDetail, Vehicle, ChatSession, FormField, TableColumn } from "@/lib/types"
import { toast } from "sonner"
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Car,
  MessageSquare,
  Star,
} from "lucide-react"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const userId = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => api.get<UserDetail>(`/admin/users/${userId}`),
  })
  const user = data?.data;

    const { data: userVehiclesResp } = useQuery({
      queryKey: ["vehicles", "by-user", userId],
      queryFn: () => api.get<Vehicle[]>(`/admin/vehicles/by-user/${userId}`),
    })
    const userVehicles = userVehiclesResp?.data;

    const { data: userChatsResp } = useQuery({
      queryKey: ["chats", "user", userId],
      queryFn: () => api.get<ChatSession[]>(`/admin/chats/user/${userId}`),
    })
    const userChats = userChatsResp?.data;

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => api.put(`/admin/users/${userId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      toast.success("User updated successfully");
      setIsEditing(false)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: () => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      toast.success("User deleted successfully");
      router.push("/users")
    },
  })

  const verifyUserMutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${userId}/verify`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      toast.success("User verified successfully");
    },
  })


    const vehicleColumns: TableColumn<Vehicle>[] = [
      { key: "_id", label: "ID" },
      { key: "model", label: "Model" },
      { key: "brand", label: "Brand" },
      { key: "year", label: "Year" },
      { key: "registration_number", label: "Registration" },
      {
        key: "is_active",
        label: "Status",
        render: (value: boolean) => <Badge variant={value ? "default" : "secondary"}>{value ? "Active" : "Inactive"}</Badge>,
      },
    ];

    const chatColumns: TableColumn<ChatSession>[] = [
      { key: "_id", label: "Session ID" },
      { key: "chat_title", label: "Title" },
      { key: "created_at", label: "Started" },
      {
        key: "updated_at",
        label: "Last Updated",
        render: (value: string) => new Date(value).toLocaleString(),
      },
    ];

  const userFormFields: FormField[] = [
    { name: "first_name", label: "First Name", type: "text", required: true },
    { name: "last_name", label: "Last Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text" },
    { name: "address", label: "Address", type: "textarea" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "suspended", label: "Suspended" },
      ],
    },
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground">Manage user information and view activity</p>
        </div>
        <div className="flex gap-2">
          {!user.email_verified && (
            <Button
              variant="outline"
              onClick={() => verifyUserMutation.mutate()}
              disabled={verifyUserMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify Email
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteUserMutation.mutate()}
            disabled={deleteUserMutation.isPending}
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
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">ID: {user.id}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
                {user.email_verified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.address}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="vehicles" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="chats">Chat History</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Registered Vehicles
                  </CardTitle>
                  <CardDescription>Vehicles registered under this user account</CardDescription>
                </CardHeader>
                <CardContent>
                     <DynamicTable
                       data={userVehicles || []}
                       idKey="_id"
                       columns={vehicleColumns}
                       title="Registered Vehicles"
                     />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chats">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chat Sessions
                  </CardTitle>
                  <CardDescription>Communication history with mechanics</CardDescription>
                </CardHeader>
                <CardContent>
                     <DynamicTable
                       data={userChats || []}
                       idKey="_id"
                       columns={chatColumns}
                       title="Chat Sessions"
                     />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent user activities and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(user.recent_activities || []).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <Star className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                        <Badge variant="outline">{activity.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <DynamicForm
            fields={userFormFields}
            initialData={user}
            onSubmit={(data) => updateUserMutation.mutate(data)}
            onCancel={() => setIsEditing(false)}
            loading={updateUserMutation.isPending}
            title="Edit User"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
