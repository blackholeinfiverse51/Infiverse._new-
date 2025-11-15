import { Sun, Moon } from "lucide-react"
import { Button } from "../components/ui/button"
import { useTheme } from "./theme-provider"

export function SimpleModeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme()

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle theme"
      className={className}
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-primary" />
      ) : (
        <Sun className="h-5 w-5 text-accent" />
      )}
    </Button>
  )
}
