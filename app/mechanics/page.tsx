"use client"

import { useState, useEffect } from "react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Mechanic, TableColumn, FormField } from "@/lib/types"
import { Plus, Star, X, Clock, ChevronUp, ChevronDown, Upload, User } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

// Profile Picture Upload Component
function ProfilePictureUpload({
  value,
  onChange,
  currentImageUrl
}: {
  value: File | null;
  onChange: (file: File | null) => void;
  currentImageUrl?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else if (currentImageUrl) {
      setPreview(currentImageUrl);
    } else {
      setPreview(null);
    }
  }, [value, currentImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(currentImageUrl || null);
  };

  return (
    <div className="space-y-2">
      <Label>Profile Picture</Label>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {preview ? (
            <AvatarImage src={preview} alt="Profile" />
          ) : (
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex gap-2">
          <Label htmlFor="profile-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-accent">
              <Upload className="h-4 w-4" />
              {value ? 'Change' : 'Upload'}
            </div>
            <Input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </Label>
          {(value || (currentImageUrl && preview)) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Chip-based selection component
function ChipSelector({
  options,
  selected,
  onSelect,
  onRemove,
  label,
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onSelect: (value: string) => void
  onRemove: (value: string) => void
  label: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <Badge
              key={option.value}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => isSelected ? onRemove(option.value) : onSelect(option.value)}
            >
              {option.label}
              {isSelected && <X className="h-3 w-3 ml-1" />}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}

// Time Picker Component
function TimePicker({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  label: string;
}) {
  const [hours, setHours] = useState("09")
  const [minutes, setMinutes] = useState("00")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      setHours(h || "09")
      setMinutes(m || "00")
    }
  }, [value])

  const handleHourChange = (newHour: string) => {
    const hour = newHour.padStart(2, '0')
    setHours(hour)
    onChange(`${hour}:${minutes}`)
  }

  const handleMinuteChange = (newMinute: string) => {
    const minute = newMinute.padStart(2, '0')
    setMinutes(minute)
    onChange(`${hours}:${minute}`)
  }

  const incrementHour = () => {
    let newHour = parseInt(hours) + 1
    if (newHour > 23) newHour = 0
    handleHourChange(newHour.toString())
  }

  const decrementHour = () => {
    let newHour = parseInt(hours) - 1
    if (newHour < 0) newHour = 23
    handleHourChange(newHour.toString())
  }

  const incrementMinute = () => {
    let newMinute = parseInt(minutes) + 5
    if (newMinute >= 60) newMinute = 0
    handleMinuteChange(newMinute.toString())
  }

  const decrementMinute = () => {
    let newMinute = parseInt(minutes) - 5
    if (newMinute < 0) newMinute = 55
    handleMinuteChange(newMinute.toString())
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <Clock className="mr-2 h-4 w-4" />
            {value || "Select time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex items-center space-x-2">
            {/* Hours */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="outline"
                size="icon"
                onClick={incrementHour}
                className="h-8 w-8"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => handleHourChange(e.target.value)}
                className="w-16 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={decrementHour}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-2xl">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="outline"
                size="icon"
                onClick={incrementMinute}
                className="h-8 w-8"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => handleMinuteChange(e.target.value)}
                className="w-16 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={decrementMinute}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange("09:00")}
            >
              🌅 9:00
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange("12:00")}
            >
              🕛 12:00
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange("17:00")}
            >
              🕔 17:00
            </Button>
          </div>

          <Button
            className="w-full mt-4"
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}

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

const expertiseOptions = [
  { value: "engine", label: "Engine" },
  { value: "electrical", label: "Electrical" },
  { value: "bodywork", label: "Bodywork" },
  { value: "transmission", label: "Transmission" },
  { value: "brakes", label: "Brakes" },
  { value: "suspension", label: "Suspension" },
  { value: "air_conditioning", label: "Air Conditioning" },
  { value: "diagnostics", label: "Diagnostics" },
  { value: "oil_change", label: "Oil Change" },
  { value: "tire_repair", label: "Tire Repair" },
  { value: "exhaust_system", label: "Exhaust System" },
  { value: "battery_replacement", label: "Battery Replacement" },
  { value: "radiator_repair", label: "Radiator Repair" },
  { value: "fuel_system", label: "Fuel System" },
  { value: "electronics", label: "Electronics" },
  { value: "painting", label: "Painting" },
]

const workingDaysOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
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
  { name: "years_of_experience", label: "Years of Experience", type: "number", required: true },
  { name: "workshop_name", label: "Workshop Name", type: "text" },
  { name: "is_verified", label: "Verified", type: "checkbox" },
  { name: "is_available", label: "Available", type: "checkbox" },
];

export default function MechanicsPage() {
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [expertiseValues, setExpertiseValues] = useState<string[]>([])
  const [workingDaysValues, setWorkingDaysValues] = useState<string[]>([])
  const [startTime, setStartTime] = useState("09:00")
    const [endTime, setEndTime] = useState("18:00")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const { data: mechanicsResp, isLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: () => api.get<Mechanic[]>("/mechanics/"),
  })
  const mechanics = mechanicsResp?.data || []

  useEffect(() => {
    if (selectedMechanic && isFormOpen) {
      setExpertiseValues(Array.isArray(selectedMechanic.expertise) ? selectedMechanic.expertise : [])
      setWorkingDaysValues(selectedMechanic.working_days || [])
      setStartTime(selectedMechanic.working_hours?.start_time || "09:00")
      setEndTime(selectedMechanic.working_hours?.end_time || "18:00")
      setProfilePicture(null) // Reset file input when editing
    } else if (!selectedMechanic && isFormOpen) {
      setExpertiseValues([])
      setWorkingDaysValues([])
      setStartTime("09:00")
      setEndTime("18:00")
      setProfilePicture(null)
    }
  }, [selectedMechanic, isFormOpen])

  const createMechanicMutation = useMutation({
    mutationFn: (formData: FormData) => api.post(`/mechanics/register`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      setIsFormOpen(false)
      setExpertiseValues([])
      setWorkingDaysValues([])
      setStartTime("09:00")
      setEndTime("18:00")
      setProfilePicture(null)
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
      setExpertiseValues([])
      setWorkingDaysValues([])
      setStartTime("09:00")
      setEndTime("18:00")
      setProfilePicture(null)
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
    const isUpdating = !!selectedMechanic;
    const formData = new FormData();
    
    // Validate time order
    if (startTime && endTime && startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }
    
    // Validate and parse latitude and longitude
    const latitude = parseFloat(data.latitude);
    const longitude = parseFloat(data.longitude);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error("Valid latitude and longitude are required");
      return;
    }
    
    // Create location object
    const location = {
      type: "Point",
      coordinates: [longitude, latitude]
    };
    
    // Add all form data
    for (const key in data) {
      const value = data[key];
      if (value === null || value === undefined || value === '') {
        continue;
      }

      if (key === 'is_verified' || key === 'is_available') {
        formData.append(key, value ? 'true' : 'false');
      } else if (key === 'workshop_name' || key === 'email') {
        formData.append(key, value);
      } else {
        // Include latitude and longitude in the form data
        formData.append(key, String(value));
      }
    }
    
    // Add profile picture if provided
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }
    
    // Add location as JSON string
    formData.append('location', JSON.stringify(location));
    
    // Add time values
    if (startTime) formData.append('start_time', startTime);
    if (endTime) formData.append('end_time', endTime);
    
    // Add chip values
    expertiseValues.forEach(expertise => formData.append('expertise', expertise));
    workingDaysValues.forEach(day => formData.append('working_days', day));
    
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
    if (confirm(`Are you sure you want to delete ${mechanic.full_name}?`)) {
      deleteMechanicMutation.mutate(mechanic._id)
    }
  }

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedMechanic(null);
      setExpertiseValues([]);
      setWorkingDaysValues([]);
      setStartTime("09:00");
      setEndTime("18:00");
      setProfilePicture(null);
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

        <Dialog open={isFormOpen} onOpenChange={handleFormOpenChange}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedMechanic ? "Edit Mechanic" : "Add Mechanic"}</DialogTitle>
              <DialogDescription>
                {selectedMechanic ? "Update mechanic information." : "Create a new mechanic."}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-4 -mr-4">
              <div className="space-y-4">
                {/* Profile Picture Upload */}
                <ProfilePictureUpload
                  value={profilePicture}
                  onChange={setProfilePicture}
                  currentImageUrl={selectedMechanic?.profile_picture}
                />

                {/* Chip Selectors */}
                <div className="grid gap-4 py-4">
                  <ChipSelector
                    options={expertiseOptions}
                    selected={expertiseValues}
                    onSelect={(val) => setExpertiseValues([...expertiseValues, val])}
                    onRemove={(val) => setExpertiseValues(expertiseValues.filter(v => v !== val))}
                    label="Expertise"
                  />
                  
                  <ChipSelector
                    options={workingDaysOptions}
                    selected={workingDaysValues}
                    onSelect={(val) => setWorkingDaysValues([...workingDaysValues, val])}
                    onRemove={(val) => setWorkingDaysValues(workingDaysValues.filter(v => v !== val))}
                    label="Working Days"
                  />
                </div>

                {/* Time Pickers */}
                <div className="grid grid-cols-2 gap-4">
                  <TimePicker
                    value={startTime}
                    onChange={setStartTime}
                    label="Start Time"
                  />
                  <TimePicker
                    value={endTime}
                    onChange={setEndTime}
                    label="End Time"
                  />
                </div>

                {/* Regular Form */}
                <DynamicForm
                  key={selectedMechanic?._id || 'new-mechanic'}
                  fields={mechanicFormFields}
                  initialData={
                    selectedMechanic
                      ? {
                          ...selectedMechanic,
                          latitude: selectedMechanic.location?.coordinates?.[1] ?? 0,
                          longitude: selectedMechanic.location?.coordinates?.[0] ?? 0,
                        }
                      : { is_available: true, is_verified: false }
                  }
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setSelectedMechanic(null);
                    setExpertiseValues([]);
                    setWorkingDaysValues([]);
                    setStartTime("09:00");
                    setEndTime("18:00");
                    setProfilePicture(null);
                  }}
                  title={selectedMechanic ? "Edit Mechanic" : "Add Mechanic"}
                  loading={createMechanicMutation.isPending || updateMechanicMutation.isPending}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}