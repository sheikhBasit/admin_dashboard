"use client"

import { useState, useEffect, useCallback } from "react"
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
import type { Mechanic, TableColumn, FormField, VehicleTypeEnum } from "@/lib/types"
import { Plus, Star, X, Clock, ChevronUp, ChevronDown, Upload, User, MapPin } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

// Profile Picture Upload Component (unchanged)
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

// Chip-based selection component (unchanged)
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

// Time Picker Component (unchanged)
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
  { // --- NEW COLUMN: Vehicle Types --- (Assuming the backend array field 'vehicle_types' still exists, though the name might be misleading for a single select)
  key: "serviced_vehicle_types", 
  label: "Vehicles",
  render: (value: VehicleTypeEnum[]) => (
    // Assuming you'll update this rendering later
    <div className="flex flex-wrap gap-1">
        {value}
    </div>
  )
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
const VEHICLE_TYPE_OPTIONS = [
  { value: "car", label: "Car" },
  { value: "motorbike", label: "Motorbike" },
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" },
  { value: "other", label: "Other" },
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
    type: "text", // 💡 Changed to 'text' for proper length/pattern enforcement
    required: true, 
    maxLength: 11,
    placeholder: "e.g., 03001234567",
    pattern: "^0[0-9]{10}$", 
    inputMode: "numeric" // For mobile optimization
  },
  { name: "province", label: "Province", type: "text", required: true },
  { name: "city", label: "City", type: "text", required: true },
  { 
    name: "cnic", 
    label: "CNIC", 
    type: "text", // 💡 Changed to 'text' for proper length/pattern enforcement
    required: true, 
    maxLength: 13,
    placeholder: "e.g., 3520212345671",
    pattern: "^[0-9]{13}$", 
    inputMode: "numeric" // For mobile optimization
    
  },
  { name: "address", label: "Address", type: "text", required: true },
  // 💡 Location fields are readOnly and disabled, but the DynamicForm MUST read the initialData.
  { name: "latitude", label: "Latitude", type: "number", required: true, disabled:true, readOnly:true }, 
  { name: "longitude", label: "Longitude", type: "number", required: true, disabled:true, readOnly:true }, 
  
  // ⚙️ ADDED: New single-select dropdown field for vehicle type
  { 
    name: "vehicle_type", // Using a new key 'vehicle_type' for the single value
    label: "Primary Vehicle Type",
    type: "select",
    required: true,
    options: VEHICLE_TYPE_OPTIONS,
    placeholder: "Select vehicle type"
  },
  
  { name: "years_of_experience", label: "Years of Experience", type: "number", required: true, min: 0 },
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
  const [vehicleTypeValues, setVehicleTypeValues] = useState<string[]>([]) // Keeping existing state
  // State to store the autofilled location
  const [autofillLocation, setAutofillLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  const queryClient = useQueryClient()

  const { data: mechanicsResp, isLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: () => api.get<Mechanic[]>("/mechanics/"),
  })
  
  // FIX 1: mechanicsResp is now Mechanic[] (the array directly)
  const mechanics = mechanicsResp || []
  console.log(mechanics)
  // Function: Fetches and sets current geographic location
  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    toast.info('Fetching current location...', { duration: 2000 });
    setAutofillLocation(null); // Clear old location while fetching

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAutofillLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast.success('Location fetched successfully!');
      },
      (error) => {
        console.log("Geolocation error:", error);
        toast.error('Failed to get location. Please enable location services or click "Refetch".');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, []);

  // EFFECT: Manages form state and location autofill on open
  useEffect(() => {
    if (isFormOpen) {
      if (selectedMechanic) {
        // Editing existing mechanic
        setExpertiseValues(Array.isArray(selectedMechanic.expertise) ? selectedMechanic.expertise : [])
        setWorkingDaysValues(selectedMechanic.working_days || [])
        setStartTime(selectedMechanic.working_hours?.start_time || "09:00")
        setEndTime(selectedMechanic.working_hours?.end_time || "18:00")
        setProfilePicture(null)
        // Set existing location data
        setAutofillLocation({
          latitude: selectedMechanic.location?.coordinates?.[1] ?? 0,
          longitude: selectedMechanic.location?.coordinates?.[0] ?? 0,
        });
      } else {
        // Adding new mechanic
        setExpertiseValues([])
        setWorkingDaysValues([])
        setStartTime("09:00")
        setEndTime("18:00")
        setProfilePicture(null)
        setAutofillLocation(null); // Clear previous autofill
        
        // AUTO-FILL LOCATION FOR NEW MECHANIC
        fetchCurrentLocation();
      }
    } else {
      // Form closed: cleanup
      setAutofillLocation(null);
    }
  }, [selectedMechanic, isFormOpen, fetchCurrentLocation])

  const createMechanicMutation = useMutation({
    // FIX 2a: Explicitly type the return value
    mutationFn: (formData: FormData) => api.post<Mechanic>(`/mechanics/register`, formData),
    onSuccess: (newMechanic) => { // response is now typed as Mechanic
      console.log("DEBUG: API RESPONSE - Mechanic creation successful.", newMechanic);
      
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      setIsFormOpen(false)
      // Cleanup
      setSelectedMechanic(null) 
      setExpertiseValues([])
      setWorkingDaysValues([])
      setStartTime("09:00")
      setEndTime("18:00")
      setProfilePicture(null)
      setAutofillLocation(null)
      // Use full_name for dynamic success message
      const mechanicName = newMechanic.full_name || "Mechanic";
      toast.success(`${mechanicName} created successfully!`)
    },
    onError: (error) => {
      
      console.error("Creation error:", error);
      // FIX 3: Access message property of the thrown Error object
      const errorMessage = (error as Error).message || "Failed to create mechanic. Please check the form data.";
      toast.error(errorMessage);
    }
  })

  const updateMechanicMutation = useMutation({
    // FIX 2b: Explicitly type the return value
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => api.patch<Mechanic>(`/mechanics/${id}`, formData),
    onSuccess: (updatedMechanic) => { // response is now typed as Mechanic
      console.log("DEBUG: API RESPONSE - Mechanic update successful.", updatedMechanic);
     
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      setIsFormOpen(false)
      // Cleanup
      setSelectedMechanic(null)
      setExpertiseValues([])
      setWorkingDaysValues([])
      setStartTime("09:00")
      setEndTime("18:00")
      setProfilePicture(null)
      setAutofillLocation(null)
      // Use full_name for dynamic success message
      const mechanicName = updatedMechanic.full_name || "Mechanic";
      toast.success(`${mechanicName} updated successfully!`)
    },
    onError: (error) => {
      console.error("Update error:", error);
      // FIX 3: Access message property of the thrown Error object
      const errorMessage = (error as Error).message || "Failed to update mechanic. Please check the form data.";
      toast.error(errorMessage);
    }
  })

  const deleteMechanicMutation = useMutation({
    mutationFn: (mechanicId: string) => api.delete(`/mechanics/admin/${mechanicId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      toast.success("Mechanic deleted successfully!")
    },
    onError: (error) => {
        console.error("Deletion error:", error);
        const errorMessage = (error as Error).message || "Failed to delete mechanic.";
        toast.error(errorMessage);
    }
  })

const handleFormSubmit = (data: Record<string, any>) => {
    const isUpdating = !!selectedMechanic;
    const formData = new FormData();
    
    console.log("DEBUG: SUBMISSION START - Processing form data:", data);
    
    // Validate time order
    if (startTime && endTime && startTime >= endTime) {
      toast.error("End time must be after start time");
      console.error(`DEBUG: SUBMISSION ABORTED - Invalid working hours: Start (${startTime}) >= End (${endTime})`);
      return;
    }
    
    // --- LOCATION VALIDATION (REMAINS) ---
    const finalLatitude = data.latitude !== undefined ? parseFloat(data.latitude) : 0;
    const finalLongitude = data.longitude !== undefined ? parseFloat(data.longitude) : 0;
    
    if (isNaN(finalLatitude) || isNaN(finalLongitude) || finalLatitude === 0 || finalLongitude === 0) {
      toast.error("A valid location (latitude and longitude) is required. Please refetch or try again.");
      console.error(`DEBUG: SUBMISSION ABORTED - Invalid final coordinates: Lat ${finalLatitude}, Lon ${finalLongitude}`);
      return;
    }
    // --- END LOCATION VALIDATION ---
    
    // 💡 CRITICAL FIX: Add all standard form fields (not arrays handled by chips).
    // The chip fields ('expertise' and 'working_days') are handled below using their state variables.
    for (const key in data) {
      const value = data[key];

      // Skip the array fields that the DynamicForm might mistakenly include from initialData.
      if (key === 'expertise' || key === 'working_days' || key === 'serviced_vehicle_types' || Array.isArray(value)) {
          continue;
      }
      
      if (value === null || value === undefined) continue;

      if (key === 'is_verified' || key === 'is_available') {
        // Send boolean as string 'true' or 'false'
        formData.append(key, value ? 'true' : 'false');
      } else {
        // Stringify all other fields (text, numbers, latitude, longitude, vehicle_type, etc.)
        formData.append(key, String(value));
      }
    }
    
    console.log(`DEBUG: Final Coordinates Appended to FormData: Lat ${finalLatitude}, Lon ${finalLongitude}`);

    // Add profile picture if provided
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
      console.log("DEBUG: Added profile_picture to FormData.");
    }
    
    // Add time values
    if (startTime) formData.append('start_time', startTime);
    if (endTime) formData.append('end_time', endTime);
    
    // ✅ CORRECT ARRAY HANDLING: Use separate formData.append() calls for each item.
    expertiseValues.forEach(expertise => formData.append('expertise', expertise));
    workingDaysValues.forEach(day => formData.append('working_days', day));
    
    // Log the action being taken
    if (isUpdating && selectedMechanic) {
      console.log(`DEBUG: SUBMISSION - Initiating UPDATE mutation for ID: ${selectedMechanic._id}`);
      updateMechanicMutation.mutate({ id: selectedMechanic._id, formData });
    } else {
      console.log("DEBUG: SUBMISSION - Initiating CREATE mutation.");
      createMechanicMutation.mutate(formData);
    }
  };
  
  const handleEdit = (mechanic: Mechanic) => {
    // ⚙️ FIX: Set selectedMechanic once to the correct type. 
    // Data transformation (including the new vehicle_type field) is now handled 
    // by the DynamicForm's initialData mapping below.
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
      setAutofillLocation(null); // Final cleanup
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
                
                {/* Location Info/Autofill */}
                <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div className="flex-grow text-sm text-yellow-800 dark:text-yellow-200">
                        {selectedMechanic ? (
                             `Current Location: Lat ${autofillLocation?.latitude.toFixed(4) || 'N/A'}, Lon ${autofillLocation?.longitude.toFixed(4) || 'N/A'}`
                        ) : autofillLocation ? (
                            `Location Autofilled: Lat ${autofillLocation.latitude.toFixed(4)}, Lon ${autofillLocation.longitude.toFixed(4)}`
                        ) : (
                            'Location access required. Click "Refetch" if inputs remain zero.'
                        )}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchCurrentLocation} 
                        className="ml-auto text-yellow-700 border-yellow-700/50 dark:border-yellow-300/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                    >
                        Refetch Location
                    </Button>
                </div>
                
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
                  // 💡 FIX: Changing the key forces the DynamicForm to re-mount and read the new initialData when autofillLocation changes.
                  key={
                    selectedMechanic?._id || 
                    (autofillLocation ? 'new-mechanic-filled' : 'new-mechanic-loading') 
                  }
                  fields={mechanicFormFields}
                  // We use a Record<string, any> type cast to safely inject the new 'vehicle_type' field 
                  // into the initial data without causing a TypeScript error on the entire object literal,
                  // as the DynamicForm expects flexible data.
                  initialData={
                    selectedMechanic
                      ? ({
                          ...selectedMechanic,
                          // Use existing data for edit
                          latitude: selectedMechanic.location?.coordinates?.[1] ?? 0,
                          longitude: selectedMechanic.location?.coordinates?.[0] ?? 0,
                          // ⚙️ SAFELY pull the first vehicle type from the array (or a default) 
                          // to populate the new single-select 'vehicle_type' field.
                          vehicle_type: (selectedMechanic.serviced_vehicle_types?.[0] as string) || VEHICLE_TYPE_OPTIONS[0].value,
                        } as Record<string, any>) // Casting for safety
                      : ({ 
                          is_available: true, 
                          is_verified: false,
                          // Use autofilled location for new entry
                          latitude: autofillLocation?.latitude ?? 0,
                          longitude: autofillLocation?.longitude ?? 0,
                          // ⚙️ Provide a default value for the dropdown field
                          vehicle_type: VEHICLE_TYPE_OPTIONS[0].value,
                        } as Record<string, any>) // Casting for safety
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