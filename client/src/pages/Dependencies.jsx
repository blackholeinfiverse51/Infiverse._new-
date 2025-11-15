import { DependencyGraph } from "../components/dependencies/dependency-graph"
import { DependencyControls } from "../components/dependencies/dependency-controls"
import { Network } from "lucide-react"

function Dependencies() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header Section - Settings Style */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
            <Network className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Dependencies</h1>
            <p className="text-muted-foreground">Visualize and manage task dependencies across departments</p>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <DependencyControls />

      {/* Graph Container */}
      <div className="border-2 rounded-xl p-4 md:p-6 bg-card shadow-xl min-h-[600px] flex flex-col">
        <DependencyGraph />
      </div>
    </div>
  )
}

export default Dependencies
