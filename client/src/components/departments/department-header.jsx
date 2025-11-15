"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Plus, Building2 } from "lucide-react"
import { CreateDepartmentDialog } from "./create-department-dialog"

export function DepartmentHeader() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center shadow-md border-2 border-primary/20">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground text-base">Manage departments and their tasks</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="h-11 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Department
        </Button>
      </div>

      <CreateDepartmentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
