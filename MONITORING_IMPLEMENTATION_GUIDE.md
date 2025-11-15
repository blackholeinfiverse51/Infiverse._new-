# 🎨 Employee Monitoring - Implementation Guide

## Quick Reference

### Before vs After

#### BEFORE (Current)
```
┌─────────────────────────────────────────┐
│ Cluttered header                        │
├─────────────────────────────────────────┤
│ [Tab 1] [Tab 2] [Control] [Filter]     │
├─────────────────────────────────────────┤
│ ┌─────────────┐  ┌────────────────────┐│
│ │ Selection   │  │ Status + Controls  ││
│ │ + Controls  │  │ + Active Content   ││
│ └─────────────┘  └────────────────────┘│
│                                         │
│ Mixed content, hard to read             │
└─────────────────────────────────────────┘
```

#### AFTER (Improved)
```
┌─────────────────────────────────────────┐
│ 📊 Employee Monitoring                  │
│ Real-time activity tracking...          │
├─────────────────────────────────────────┤
│ [Dashboard] [Screenshots] [Alerts]      │
├─────────────────────────────────────────┤
│ 
│ ┌──────────────┐  ┌─────────────────┐  │
│ │ Selection    │  │ Status          │  │
│ │ ───────────  │  │ ───────────     │  │
│ │ • John       │  │ Employee: John  │  │
│ │ • Jane       │  │ Status: Active  │  │
│ │              │  │                 │  │
│ │ Controls     │  │ Controls        │  │
│ │ ───────────  │  │ ───────────     │  │
│ │ ☑ Intelligent│  │ [Start] [Stop]  │  │
│ │              │  │                 │  │
│ └──────────────┘  └─────────────────┘  │
│
│ ┌──────────────────────────────────────┐
│ │ Dashboard Content                    │
│ │ (Clean, focused area)                │
│ │                                      │
│ │ Charts, metrics, real-time data     │
│ └──────────────────────────────────────┘
└─────────────────────────────────────────┘
```

---

## Step-by-Step Implementation

### Step 1: Header Section

**File**: `/client/src/pages/EmployeeMonitoring.jsx`

Replace the current header with:

```jsx
{/* Header Section */}
<div className="space-y-2 mb-8">
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <Monitor className="h-5 w-5 text-primary" />
    </div>
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Employee Monitoring</h1>
      <p className="text-muted-foreground">
        Real-time activity tracking and productivity insights
      </p>
    </div>
  </div>
</div>
```

### Step 2: Tab Navigation

Replace mixed tabs with clean navigation:

```jsx
{/* Tabs Navigation - Separated */}
<div className="flex gap-2 mb-6 overflow-x-auto pb-2">
  <TabsList className="h-auto p-0 bg-transparent">
    <TabsTrigger 
      value="overview"
      className="flex items-center gap-2 py-2 px-4 rounded-lg border-2 border-muted data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-primary-foreground transition-all duration-200"
    >
      <LayoutDashboard className="h-4 w-4" />
      <span className="hidden sm:inline">Overview</span>
    </TabsTrigger>
    <TabsTrigger 
      value="dashboard"
      className="flex items-center gap-2 py-2 px-4 rounded-lg border-2 border-muted data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-primary-foreground transition-all duration-200"
    >
      <Activity className="h-4 w-4" />
      <span className="hidden sm:inline">Dashboard</span>
    </TabsTrigger>
    <TabsTrigger 
      value="screenshots"
      className="flex items-center gap-2 py-2 px-4 rounded-lg border-2 border-muted data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-primary-foreground transition-all duration-200"
    >
      <Camera className="h-4 w-4" />
      <span className="hidden sm:inline">Screenshots</span>
    </TabsTrigger>
    {/* More tabs... */}
  </TabsList>
</div>
```

### Step 3: Three-Column Layout

```jsx
{/* Main Layout - Three Columns */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Left Panel - Employee Selection & Controls */}
  <div className="lg:col-span-1 space-y-4">
    {/* Employee Selection Card */}
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base">Select Employee</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10" />
        </div>
        
        {/* Department filter */}
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {/* Department options */}
          </SelectContent>
        </Select>
        
        {/* Employee list */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredEmployees.map(emp => (
            <button
              key={emp._id}
              onClick={() => setSelectedEmployee(emp)}
              className={`w-full text-left p-3 rounded-lg transition-all ${ selectedEmployee?._id === emp._id
                ? 'bg-primary/10 border border-primary'
                : 'bg-muted/50 hover:bg-muted border border-transparent'
              }`}
            >
              <p className="font-medium text-sm">{emp.name}</p>
              <p className="text-xs text-muted-foreground">{emp.email}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Monitoring Status Card */}
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <CardTitle className="text-base">Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded text-sm">
          <span className="text-muted-foreground">Employee:</span>
          <span className="font-medium">{selectedEmployee?.name || 'None'}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded text-sm">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={monitoringStatus.monitoring?.active ? 'default' : 'secondary'}>
            {monitoringStatus.monitoring?.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardContent>
    </Card>

    {/* Controls Card */}
    <Card className="border-l-4 border-l-accent">
      <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Eye className="h-4 w-4 text-accent" />
          </div>
          <CardTitle className="text-base">Controls</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
          <Label className="text-sm font-medium cursor-pointer">Intelligent Mode</Label>
          <Switch 
            checked={intelligentMode}
            onCheckedChange={setIntelligentMode}
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={startMonitoring}
            disabled={!selectedEmployee || loading}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
          <Button 
            onClick={stopMonitoring}
            disabled={!selectedEmployee || loading}
            variant="outline"
            className="flex-1"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Right Panel - Content Area */}
  <div className="lg:col-span-3">
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tab Contents */}
      <TabsContent value="overview" className="space-y-6">
        {selectedEmployee ? (
          <div className="space-y-6">
            {/* Overview content */}
            <MonitoringDashboard
              employee={selectedEmployee}
              monitoringStatus={monitoringStatus}
            />
          </div>
        ) : (
          <EmptyState message="Select an employee to view monitoring data" />
        )}
      </TabsContent>
      
      {/* More tabs... */}
    </Tabs>
  </div>
</div>
```

### Step 4: Empty State Component

```jsx
function EmptyState({ message }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Data Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {message}
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## Color Coding Guide

| Element | Color | Hex |
|---------|-------|-----|
| Primary Actions | Primary | `hsl(var(--primary))` |
| Status | Green | `rgb(34, 197, 94)` |
| Alerts | Red | `rgb(239, 68, 68)` |
| Warnings | Yellow | `rgb(234, 179, 8)` |
| Secondary | Muted | `hsl(var(--muted))` |

---

## Responsive Breakpoints

| Breakpoint | Layout |
|-----------|---------|
| Mobile (<640px) | Stack vertically, tabs horizontal scroll |
| Tablet (640-1024px) | 2-column: sidebar + content |
| Desktop (>1024px) | 3-column: selection (1) + controls (1) + content (2) |

---

## Testing Checklist

- [ ] Header displays correctly
- [ ] Tabs switch content properly
- [ ] Employee selection updates status
- [ ] Monitoring controls enable/disable based on selection
- [ ] Cards show proper gradients and borders
- [ ] Empty states display when no employee selected
- [ ] Responsive layout works on mobile
- [ ] Hover effects work smoothly
- [ ] Colors match design system
- [ ] Text is readable in both light/dark modes

---

## Expected Result

✅ Clean, organized layout
✅ Improved user focus
✅ Better information hierarchy
✅ Consistent with Settings page
✅ Professional appearance
✅ Better mobile experience
✅ Easier to maintain

---

