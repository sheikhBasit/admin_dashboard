"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DynamicTable } from "@/components/ui/dynamic-table"
import { DynamicForm } from "@/components/ui/dynamic-form"
import type { User, TableColumn, FormField } from "@/lib/types"
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

// ...existing code...

const userColumns: TableColumn<User>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "phone_number", label: "Phone" },
  {
    key: "is_verified",
    label: "Verified",
    render: (value: boolean) => (
      <Badge variant={value ? "default" : "secondary"}>{value ? "Verified" : "Unverified"}</Badge>
    ),
  },
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

const userFormFields: FormField[] = [
  { name: "name", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone_number", label: "Phone Number", type: "text" },
  { name: "is_verified", label: "Verified", type: "checkbox" },
  { name: "is_active", label: "Active", type: "checkbox" },
]

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch users from the real API
  const { data: usersResp, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("/auth/admin/users"),
  })
  const users = usersResp?.data || []
  console.log(users)
  // Mutations for create, update, and delete
  const createUserMutation = useMutation({
    mutationFn: (user: Partial<User>) => api.post(`/admin/users`, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsFormOpen(false)
      setSelectedUser(null)
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: (user: User) => api.put(`/admin/users/${user.id}`, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsFormOpen(false)
      setSelectedUser(null)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      deleteUserMutation.mutate(user.id)
    }
  }

  const handleFormSubmit = (data: Record<string, any>) => {
    if (selectedUser) {
      updateUserMutation.mutate({ ...selectedUser, ...data })
    } else {
      createUserMutation.mutate(data)
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedUser(null)
  }

  return (
    <DashboardLayout>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <Button onClick={() => { setSelectedUser(null); setIsFormOpen(true); }}>
            Add User
          </Button>
        </div>

        <DynamicTable
          data={users}
          columns={userColumns}
          title="User Management"
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Edit User" : "Add User"}</DialogTitle>
              <DialogDescription>
                {selectedUser ? "Update user information." : "Create a new user."}
              </DialogDescription>
            </DialogHeader>
            <DynamicForm
              fields={userFormFields}
              initialData={selectedUser || {}}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              title={selectedUser ? "Edit User" : "Add User"}
              loading={createUserMutation.isPending || updateUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </main>
    </DashboardLayout>
  )
}
