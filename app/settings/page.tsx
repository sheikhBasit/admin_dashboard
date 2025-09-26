'use client';

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AppSettings, UserProfile } from "@/lib/types";
import { User, Building, Bell, Shield, Palette, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const ProfileForm = ({ profile, setProfile, onUpdate, isPending }: any) => {
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev: UserProfile) => ({ ...prev, [field]: value }));
  };

  const initials = useMemo(() => {
    if (!profile?.name) return "";
    return profile.name
      .split(" ")
      .map((n: string) => n[0])
      .join("");
  }, [profile?.name]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Profile Information</span>
        </CardTitle>
        <CardDescription>Update your personal information and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline">Change Avatar</Button>
            <p className="text-sm text-muted-foreground mt-1">JPG, GIF or PNG. 1MB max.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={profile?.name || ""} onChange={(e) => handleInputChange("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={profile?.phone || ""} onChange={(e) => handleInputChange("phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={profile?.role || ""} disabled />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile?.bio || ""}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Tell us about yourself..."
          />
        </div>
        <Button onClick={onUpdate} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </CardContent>
    </Card>
  );
};

const CompanyForm = ({ appSettings, setAppSettings, onUpdate, isPending }: any) => {
  const handleInputChange = (field: keyof AppSettings, value: string | boolean) => {
    setAppSettings((prev: AppSettings) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5" />
          <span>Company Information</span>
        </CardTitle>
        <CardDescription>Manage your business details and settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={appSettings?.company_name || ""}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-phone">Phone</Label>
            <Input
              id="company-phone"
              value={appSettings?.company_phone || ""}
              onChange={(e) => handleInputChange("company_phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-email">Email</Label>
            <Input
              id="company-email"
              type="email"
              value={appSettings?.company_email || ""}
              onChange={(e) => handleInputChange("company_email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-hours">Business Hours</Label>
            <Input
              id="business-hours"
              value={appSettings?.business_hours || ""}
              onChange={(e) => handleInputChange("business_hours", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-address">Address</Label>
          <Textarea
            id="company-address"
            value={appSettings?.company_address || ""}
            onChange={(e) => handleInputChange("company_address", e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={appSettings?.timezone || ""} onValueChange={(value) => handleInputChange("timezone", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={appSettings?.currency || ""} onValueChange={(value) => handleInputChange("currency", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={appSettings?.language || ""} onValueChange={(value) => handleInputChange("language", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={onUpdate} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Company Settings
        </Button>
      </CardContent>
    </Card>
  );
};

const NotificationsForm = ({ appSettings, setAppSettings, onUpdate, isPending }: any) => {
  const handleSwitchChange = (field: keyof AppSettings, checked: boolean) => {
    setAppSettings((prev: AppSettings) => ({ ...prev, [field]: checked }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notification Preferences</span>
        </CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications about important events</p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={appSettings?.notifications_enabled || false}
              onCheckedChange={(checked) => handleSwitchChange("notifications_enabled", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={appSettings?.email_notifications || false}
              onCheckedChange={(checked) => handleSwitchChange("email_notifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified via text message</p>
            </div>
            <Switch
              id="sms-notifications"
              checked={appSettings?.sms_notifications || false}
              onCheckedChange={(checked) => handleSwitchChange("sms_notifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Receive updates about new features</p>
            </div>
            <Switch
              id="marketing-emails"
              checked={appSettings?.marketing_emails || false}
              onCheckedChange={(checked) => handleSwitchChange("marketing_emails", checked)}
            />
          </div>
        </div>
        <Button onClick={onUpdate} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Notification Settings
        </Button>
      </CardContent>
    </Card>
  );
};

const AppearanceForm = ({ appSettings, setAppSettings, onUpdate, isPending }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Appearance</span>
        </CardTitle>
        <CardDescription>Customize the look and feel of your dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={appSettings?.theme || "system"}
            onValueChange={(value) => setAppSettings({ ...appSettings, theme: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Choose your preferred theme or use system setting</p>
        </div>
        <Button onClick={onUpdate} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Appearance
        </Button>
      </CardContent>
    </Card>
  );
};

const SecurityTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Security Settings</span>
        </CardTitle>
        <CardDescription>Manage your account security</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Change Password</h4>
            <div className="space-y-2">
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <Button className="mt-2">Update Password</Button>
          </div>
          <div>
            <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground mb-3">Add an extra layer of security to your account</p>
            <Button variant="outline">Enable 2FA</Button>
          </div>
          <div>
            <h4 className="font-medium mb-2">Active Sessions</h4>
            <p className="text-sm text-muted-foreground mb-3">Manage your active sessions across devices</p>
            <Button variant="outline">View Sessions</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Fetch profile data from the server
  const { data: initialProfileData } = useQuery<UserProfile>({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      // Mock data for example
      return {
        name: "Admin User",
        email: "johndoe13@example.com",
        phone: "+1 (555) 123-4567",
        avatar: "",
        role: "admin",
        bio: "System administrator with full access to all features.",
      };
    },
  });

  // Create a local state for the profile form
  const [profile, setProfile] = useState<UserProfile>(initialProfileData || {
    name: "",
    email: "",
    phone: "",
    avatar: "",
    role: "",
    bio: "",
  });

  // Sync the local state with the fetched data
  useEffect(() => {
    if (initialProfileData) {
      setProfile(initialProfileData);
    }
  }, [initialProfileData]);

  // useMutation hook for updating the profile
  const { mutate: updateProfile, isPending: isProfileUpdating } = useMutation({
    mutationFn: (updatedProfile: UserProfile) => api.put(`/admin/profile`, updatedProfile),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  // Fetch app settings data from the server
  const { data: initialAppSettingsData } = useQuery<AppSettings>({
    queryKey: ["app-settings"],
    queryFn: async () => {
      // Mock data for example
      return {
        company_name: "AutoService Pro",
        company_logo: "",
        company_address: "123 Main St, City, State 12345",
        company_phone: "+1 (555) 987-6543",
        company_email: "info@autoservice.com",
        business_hours: "9:00 AM - 6:00 PM",
        timezone: "America/New_York",
        currency: "USD",
        language: "en",
        theme: "system",
        notifications_enabled: true,
        email_notifications: true,
        sms_notifications: false,
        marketing_emails: true,
      };
    },
  });
  
  // Create a local state for the app settings form
  const [appSettings, setAppSettings] = useState<AppSettings>(initialAppSettingsData || {
    company_name: "",
    company_logo: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    business_hours: "",
    timezone: "",
    currency: "",
    language: "",
    theme: "system",
    notifications_enabled: false,
    email_notifications: false,
    sms_notifications: false,
    marketing_emails: false,
  });

  // Sync the local state with the fetched data
  useEffect(() => {
    if (initialAppSettingsData) {
      setAppSettings(initialAppSettingsData);
    }
  }, [initialAppSettingsData]);

  // useMutation hook for updating app settings
  const { mutate: updateAppSettings, isPending: isSettingsUpdating } = useMutation({
    mutationFn: (updatedSettings: AppSettings) => api.put(`/admin/settings`, updatedSettings),
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-4">
            <ProfileForm
              profile={profile}
              setProfile={setProfile}
              onUpdate={() => updateProfile(profile)}
              isPending={isProfileUpdating}
            />
          </TabsContent>
          <TabsContent value="company" className="space-y-4">
            <CompanyForm
              appSettings={appSettings}
              setAppSettings={setAppSettings}
              onUpdate={() => updateAppSettings(appSettings)}
              isPending={isSettingsUpdating}
            />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <NotificationsForm
              appSettings={appSettings}
              setAppSettings={setAppSettings}
              onUpdate={() => updateAppSettings(appSettings)}
              isPending={isSettingsUpdating}
            />
          </TabsContent>
          <TabsContent value="security" className="space-y-4">
            <SecurityTab />
          </TabsContent>
          <TabsContent value="appearance" className="space-y-4">
            <AppearanceForm
              appSettings={appSettings}
              setAppSettings={setAppSettings}
              onUpdate={() => updateAppSettings(appSettings)}
              isPending={isSettingsUpdating}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}