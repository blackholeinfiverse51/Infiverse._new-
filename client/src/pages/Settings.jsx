import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ProfileSettings } from "../components/settings/profile-settings"
import { NotificationSettings } from "../components/settings/notification-settings"
import  ConsentSettings  from "../components/settings/ConsentSettings"
import { Settings as SettingsIcon, User, Bell, ShieldCheck } from "lucide-react"

function Settings() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and workspace settings</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        {/* Tabs Navigation - Separated from content */}
        <div className="flex gap-4 mb-6">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="profile" 
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl border-2 border-muted data-[state=active]:bg-green-500 data-[state=active]:border-green-500 data-[state=active]:text-white transition-all duration-200 hover:border-green-500/50"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Profile</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="notifications" 
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl border-2 border-muted data-[state=active]:bg-green-500 data-[state=active]:border-green-500 data-[state=active]:text-white transition-all duration-200 hover:border-green-500/50"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Notifications</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="consent" 
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl border-2 border-muted data-[state=active]:bg-green-500 data-[state=active]:border-green-500 data-[state=active]:text-white transition-all duration-200 hover:border-green-500/50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Consent</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area - Separated from tabs */}
        <div className="mt-6">
          <TabsContent value="profile" className="m-0">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="notifications" className="m-0">
            <NotificationSettings />
          </TabsContent>
          <TabsContent value="consent" className="m-0">
            <ConsentSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default Settings
