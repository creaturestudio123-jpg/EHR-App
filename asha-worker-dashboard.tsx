"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { seedDemoData } from "@/lib/demo-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SyncStatusIndicator } from "@/components/sync/sync-status-indicator"
import { PatientList } from "@/components/patients/patient-list"
import { AddPatientForm } from "@/components/patients/add-patient-form"
import { RemindersList } from "@/components/reminders/reminders-list"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { Users, Plus, Bell, Calendar, Activity, LogOut, Menu, Heart } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type DashboardView = "overview" | "patients" | "add-patient" | "reminders" | "records"

export function AshaWorkerDashboard() {
  const { user, logout } = useAuth()
  const { isInitialized } = useOfflineStorage()
  const [currentView, setCurrentView] = useState<DashboardView>("overview")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Seed demo data when dashboard loads
    if (isInitialized) {
      seedDemoData()
    }
  }, [isInitialized])

  const texts = {
    en: {
      welcome: "Welcome",
      dashboard: "Dashboard",
      overview: "Overview",
      patients: "Patients",
      addPatient: "Add Patient",
      reminders: "Reminders",
      records: "Records",
      logout: "Logout",
      menu: "Menu",
      totalPatients: "Total Patients",
      pendingReminders: "Pending Reminders",
      overdueReminders: "Overdue Reminders",
      recentRecords: "Recent Records",
      quickActions: "Quick Actions",
      registerNewPatient: "Register New Patient",
      viewAllPatients: "View All Patients",
      checkReminders: "Check Reminders",
      addHealthRecord: "Add Health Record",
    },
    hi: {
      welcome: "स्वागत है",
      dashboard: "डैशबोर्ड",
      overview: "अवलोकन",
      patients: "मरीज़",
      addPatient: "मरीज़ जोड़ें",
      reminders: "रिमाइंडर",
      records: "रिकॉर्ड",
      logout: "लॉग आउट",
      menu: "मेनू",
      totalPatients: "कुल मरीज़",
      pendingReminders: "लंबित रिमाइंडर",
      overdueReminders: "देर से रिमाइंडर",
      recentRecords: "हाल के रिकॉर्ड",
      quickActions: "त्वरित कार्य",
      registerNewPatient: "नया मरीज़ पंजीकृत करें",
      viewAllPatients: "सभी मरीज़ देखें",
      checkReminders: "रिमाइंडर जांचें",
      addHealthRecord: "स्वास्थ्य रिकॉर्ड जोड़ें",
    },
  }

  const t = texts[user?.language || "en"]

  const menuItems = [
    { id: "overview", label: t.overview, icon: Activity },
    { id: "patients", label: t.patients, icon: Users },
    { id: "add-patient", label: t.addPatient, icon: Plus },
    { id: "reminders", label: t.reminders, icon: Bell },
  ]

  const quickActions = [
    {
      title: t.registerNewPatient,
      description: "Add a new patient to your records",
      icon: Plus,
      action: () => setCurrentView("add-patient"),
      color: "bg-blue-500",
    },
    {
      title: t.viewAllPatients,
      description: "View and manage patient records",
      icon: Users,
      action: () => setCurrentView("patients"),
      color: "bg-green-500",
    },
    {
      title: t.checkReminders,
      description: "View upcoming appointments and tasks",
      icon: Bell,
      action: () => setCurrentView("reminders"),
      color: "bg-orange-500",
    },
  ]

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return (
          <div className="space-y-6">
            <StatsCards />

            <SyncStatusIndicator showDetails={true} className="w-full" />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  <Heart className="w-5 h-5 text-primary" />
                  {t.quickActions}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 justify-start touch-target bg-transparent"
                      onClick={action.action}
                    >
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-4`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className={`font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                          {action.title}
                        </div>
                        <div className="text-sm text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  <Calendar className="w-5 h-5 text-primary" />
                  {t.reminders}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RemindersList limit={3} />
                <Button
                  variant="ghost"
                  className="w-full mt-4 touch-target"
                  onClick={() => setCurrentView("reminders")}
                >
                  View All Reminders
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case "patients":
        return <PatientList />

      case "add-patient":
        return (
          <AddPatientForm
            onSuccess={() => {
              setCurrentView("patients")
            }}
            onCancel={() => setCurrentView("overview")}
          />
        )

      case "reminders":
        return <RemindersList />

      default:
        return <div>View not implemented</div>
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing offline storage...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="touch-target">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    <Heart className="w-5 h-5 text-primary" />
                    EHR Companion
                  </SheetTitle>
                  <SheetDescription className={user?.language === "hi" ? "hindi-text" : ""}>
                    {t.welcome}, {user?.name}
                  </SheetDescription>
                </SheetHeader>

                <nav className="mt-8 space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentView === item.id ? "default" : "ghost"}
                      className={`w-full justify-start touch-target ${user?.language === "hi" ? "hindi-text" : ""}`}
                      onClick={() => {
                        setCurrentView(item.id as DashboardView)
                        setIsMenuOpen(false)
                      }}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                  <Button
                    variant="outline"
                    className={`w-full touch-target ${user?.language === "hi" ? "hindi-text" : ""}`}
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.logout}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div>
              <h1 className={`text-lg font-semibold ${user?.language === "hi" ? "hindi-text" : ""}`}>
                {menuItems.find((item) => item.id === currentView)?.label || t.dashboard}
              </h1>
              <p className={`text-sm text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>
                {user?.area || "Rural Health Worker"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SyncStatusIndicator />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">{renderContent()}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around p-2">
          {menuItems.slice(0, 4).map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              size="sm"
              className="flex-col h-auto py-2 px-3 touch-target"
              onClick={() => setCurrentView(item.id as DashboardView)}
            >
              <item.icon className="w-4 h-4 mb-1" />
              <span className={`text-xs ${user?.language === "hi" ? "hindi-text" : ""}`}>{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}
