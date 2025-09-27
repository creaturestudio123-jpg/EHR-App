"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { AshaWorkerDashboard } from "@/components/dashboards/asha-worker-dashboard"
import { PhcStaffDashboard } from "@/components/dashboards/phc-staff-dashboard"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize offline storage and check for existing session
    const initializeApp = async () => {
      // Small delay to ensure proper initialization
      await new Promise((resolve) => setTimeout(resolve, 100))
      setIsInitialized(true)
    }

    initializeApp()
  }, [])

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading EHR Companion...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // Route to appropriate dashboard based on user role
  if (user.role === "asha_worker") {
    return <AshaWorkerDashboard />
  }

  if (user.role === "phc_staff") {
    return <PhcStaffDashboard />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Invalid user role. Please contact administrator.</p>
      </div>
    </div>
  )
}
