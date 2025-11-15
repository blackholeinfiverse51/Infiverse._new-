"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Progress } from "../ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { MoreHorizontal, Users, CheckSquare, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useToast } from "../../hooks/use-toast"
import { api } from "../../lib/api"
import { useSocketContext } from "../../context/socket-context"

export function DepartmentList({ onDepartmentSelect }) {
  const { toast } = useToast()
  const { events } = useSocketContext()
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [departmentTasks, setDepartmentTasks] = useState({})

  // Helper function to count active members
  const getActiveMemberCount = (members) => {
    if (!Array.isArray(members)) return 0;
    // Filter out null/undefined members (these are inactive users that didn't populate)
    return members.filter(member => member && member._id).length;
  }

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true)
        const response = await api.departments.getDepartments()
        console.log('DepartmentList - Departments response:', response)

        // Handle new API response format
        const data = response.success ? response.data : response
        setDepartments(Array.isArray(data) ? data : [])
        
        // Fetch tasks for each department
        const tasksPromises = data.map(async (dept) => {
          try {
            const departmentId = dept._id || dept.id;
            if (!departmentId) {
              console.warn('Department missing ID:', dept);
              return {
                departmentId: dept.name || 'unknown',
                tasks: { total: 0, completed: 0 }
              };
            }

            const tasks = await api.departments.getDepartmentTasks(departmentId)
            // Filter tasks that have active assignees (tasks with null assignees are filtered out by backend)
            const activeTasks = tasks.filter(task => task.assignee && task.assignee._id);
            const completed = activeTasks.filter(task => task.status === "Completed").length
            
            return {
              departmentId: departmentId,
              tasks: {
                total: activeTasks.length,
                completed: completed
              }
            }
          } catch (error) {
            console.error(`Error fetching tasks for department ${dept.name}:`, error)
            return {
              departmentId: dept._id || dept.id || dept.name,
              tasks: { total: 0, completed: 0 }
            }
          }
        })
        
        const tasksResults = await Promise.all(tasksPromises)
        const tasksMap = {}
        tasksResults.forEach(result => {
          tasksMap[result.departmentId] = result.tasks
        })
        
        setDepartmentTasks(tasksMap)
        setError(null)
      } catch (err) {
        setError(err.message || "Failed to load departments")
        toast({
          title: "Error",
          description: err.message || "Failed to load departments",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [toast])

  // Listen for socket events to update departments
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1]
      
      if (latestEvent.type === 'department-created') {
        setDepartments(prev => [...prev, latestEvent.data])
        setDepartmentTasks(prev => ({
          ...prev,
          [latestEvent.data._id || latestEvent.data.id]: { total: 0, completed: 0 }
        }))
      } 
      else if (latestEvent.type === 'department-updated') {
        setDepartments(prev => prev.map(dept => 
          (dept._id || dept.id) === (latestEvent.data._id || latestEvent.data.id) ? latestEvent.data : dept
        ))
      }
      else if (latestEvent.type === 'department-deleted') {
        setDepartments(prev => prev.filter(dept => (dept._id || dept.id) !== (latestEvent.data._id || latestEvent.data.id)))
        setDepartmentTasks(prev => {
          const newMap = {...prev}
          delete newMap[latestEvent.data._id || latestEvent.data.id]
          return newMap
        })
      }
    }
  }, [events])

  const handleDeleteDepartment = async (deptId) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        setIsDeleting(true)
        await api.departments.deleteDepartment(deptId)
        setDepartments(departments.filter(dept => (dept._id || dept.id) !== deptId))
        toast({
          title: "Success",
          description: "Department deleted successfully"
        })
      } catch (error) {
        console.error("Error deleting department:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete department",
          variant: "destructive"
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>Manage and view all departments</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading departments...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>Manage and view all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-red-500">
            <p>Error loading departments: {error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="grid">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="grid" className="mt-0">
        {departments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No departments found. Create a new department to get started.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => {
              const departmentId = department._id || department.id;
              const tasks = departmentTasks[departmentId] || { total: 0, completed: 0 }
              const completionPercentage = tasks.total > 0 
                ? Math.round((tasks.completed / tasks.total) * 100) 
                : 0
              
              // Count only active members (backend filters inactive users to null)
              const activeMemberCount = getActiveMemberCount(department.members);
              
              return (
                <Card 
                  key={departmentId} 
                  className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 hover:border-primary/30"
                  onClick={() => onDepartmentSelect && onDepartmentSelect(department)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="flex items-center gap-2.5 text-xl">
                          <div 
                            className="w-4 h-4 rounded-full shadow-lg ring-2 ring-white dark:ring-slate-900" 
                            style={{ backgroundColor: department.color }} 
                          />
                          <span className="group-hover:text-primary transition-colors">{department.name}</span>
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">{department.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="opacity-60 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onDepartmentSelect && onDepartmentSelect(department)}>
                            View Department
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Department</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDepartment(departmentId);
                            }}
                            disabled={isDeleting}
                          >
                            Delete Department
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Department Lead */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-colors group-hover:bg-muted">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage 
                          src={department.lead?.avatar || "/placeholder.svg?height=40&width=40"} 
                          alt={department.lead?.name || "Lead"} 
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {department.lead?.name ? department.lead.name.charAt(0) : "L"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {department.lead?.name || "No lead assigned"}
                          {department.lead && !department.lead.stillExist && (
                            <span className="text-xs text-red-500 ml-1.5">(Inactive)</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Department Lead</div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">{activeMemberCount}</div>
                          <div className="text-xs text-muted-foreground font-medium">Members</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                        <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">{tasks.completed}/{tasks.total}</div>
                          <div className="text-xs text-muted-foreground font-medium">Tasks</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-2.5 p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Task Completion</span>
                        <Badge variant={completionPercentage >= 75 ? "default" : completionPercentage >= 50 ? "secondary" : "outline"} className="font-bold">
                          {completionPercentage}%
                        </Badge>
                      </div>
                      <Progress value={completionPercentage} className="h-2.5 shadow-inner" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="list" className="mt-0">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-xl">All Departments</CardTitle>
            <CardDescription className="text-base">Manage and view all departments</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {departments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium">No departments found. Create a new department to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departments.map((department) => {
                  const departmentId = department._id || department.id;
                  const tasks = departmentTasks[departmentId] || { total: 0, completed: 0 }
                  const completionPercentage = tasks.total > 0 
                    ? Math.round((tasks.completed / tasks.total) * 100) 
                    : 0
                  
                  // Count only active members (backend filters inactive users to null)
                  const activeMemberCount = getActiveMemberCount(department.members);
                    
                  return (
                    <div 
                      key={departmentId} 
                      className="group flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 bg-card"
                      onClick={() => onDepartmentSelect && onDepartmentSelect(department)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-slate-900 shrink-0"
                          style={{ backgroundColor: department.color }}
                        >
                          {department.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{department.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{department.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{activeMemberCount}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                          <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-bold text-green-700 dark:text-green-300">
                            {tasks.completed}/{tasks.total}
                          </span>
                        </div>
                        <Badge 
                          variant={completionPercentage >= 75 ? "default" : completionPercentage >= 50 ? "secondary" : "outline"} 
                          className="font-bold text-base px-3 py-1 min-w-[4rem] justify-center"
                        >
                          {completionPercentage}%
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-60 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onDepartmentSelect && onDepartmentSelect(department)}>
                              View Department
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Department</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDepartment(departmentId);
                              }}
                              disabled={isDeleting}
                            >
                              Delete Department
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}