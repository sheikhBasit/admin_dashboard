"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TableColumn } from "@/lib/types"
import { ChevronDown, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"


interface DynamicTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  title: string
  searchable?: boolean
  filterable?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onAdd?: () => void
  loading?: boolean
  idKey?: keyof T; 
}



export function DynamicTable<T extends { [key: string]: any }>({
  data,
  columns,
  title,  
  searchable = true,
  filterable = false,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
  idKey = 'id' as keyof T,
}: DynamicTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({})

  // Apply global search
  let filteredData = data.filter((item) =>
    searchable
      ? Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
      : true,
  )

  // Apply column filters
  if (filterable) {
    filteredData = filteredData.filter((item) =>
      Object.entries(columnFilters).every(
        ([key, value]) => !value || String(item[key as keyof T]).toLowerCase().includes(value.toLowerCase())
      )
    )
  }

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const renderCellValue = (column: TableColumn<T>, item: T) => {
    const value = item[column.key]

    if (column.render) {
      return column.render(value, item)
    }

    // Default rendering for common data types
    if (typeof value === "boolean") {
      return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>
    }

    if (typeof value === "string" && value.includes("@")) {
      return <span className="text-blue-600">{value}</span>
    }

    return String(value)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {onAdd && <Button onClick={onAdd}>Add New</Button>}
        </div>
        {searchable && (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.key)}
                        className="h-auto p-0 font-semibold"
                      >
                        {column.label}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
                {(onEdit || onDelete) && <TableHead>Actions</TableHead>}
              </TableRow>
              {filterable && (
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={String(column.key)}>
                      <Input
                        placeholder={`Filter ${column.label}`}
                        value={columnFilters[String(column.key)] || ""}
                        onChange={(e) =>
                          setColumnFilters((prev) => ({ ...prev, [String(column.key)]: e.target.value }))
                        }
                        className="h-8 text-xs"
                      />
                    </TableHead>
                  ))}
                  {(onEdit || onDelete) && <TableHead />}
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center">
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((item) => (
                  <TableRow key={item[idKey]}>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>{renderCellValue(column, item)}</TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
