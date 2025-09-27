"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SyncStatusIndicator } from "@/components/sync/sync-status-indicator"
import { PHCStatsCards } from "@/components/dashboard/phc-stats-cards"
import { AshaWorkersList } from "@/components/phc/asha-workers-list"
import { AllPatientsList } from "@/components/phc/all-patients-list"
import { ReportsOverview } from "@/components/phc/reports-overview"
import { DataSyncPanel } from "@/components/phc/data-sync-panel"
import { Users, FileText, Activity, Database, LogOut, Menu, Shield } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type PHCDashboardView = "overview" | "asha-workers" | "all-patients" | "reports" | "sync"

export function PhcStaffDashboard() {
  const { user, logout } = useAuth()
  const { isInitialized } = useOfflineStorage()
  const [currentView, setCurrentView] = useState<PHCDashboardView>("overview")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const texts = {
    en: {
      welcome: "Welcome",
      dashboard: "PHC Dashboard",
      overview: "Overview",
      ashaWorkers: "ASHA Workers",
      allPatients: "All Patients",
      reports: "Reports",
      dataSync: "Data Sync",
      logout: "Logout",
      menu: "Menu",
      phcStaff: "PHC Staff",
      totalAshaWorkers: "Total ASHA Workers",
      totalPatients: "Total Patients",
      pendingReports: "Pending Reports",
      syncStatus: "Sync Status",
      quickActions: "Quick Actions",
      reviewReports: "Review Reports",
      manageWorkers: "Manage ASHA Workers",
      viewAllPatients: "View All Patients",
      syncData: "Sync Data",
    },
    hi: {
      welcome: "स्वागत है",
      dashboard: "पीएचसी डैशबोर्ड",
      overview: "अवलोकन",
      ashaWorkers: "आशा कार्यकर्ता",
      allPatients: "सभी मरीज़",
      reports: "रिपोर्ट",
      dataSync: "डेटा सिंक",
      logout: "लॉग आउट",
      menu: "मेनू",
      phcStaff: "पीएचसी स्टाफ",
      totalAshaWorkers: "कुल आशा कार्यकर्ता",
      totalPatients: "कुल मरीज़",
      pendingReports: "लंबित रिपोर्ट",
      syncStatus: "सिंक स्थिति",
      quickActions: "त्वरित कार्य",
      reviewReports: "रिपोर्ट समीक्षा",
      manageWorkers: "आशा कार्यकर्ता प्रबंधन",
      viewAllPatients: "सभी मरीज़ देखें",
      syncData: "डेटा सिंक करें",
    },
  }

  const t = texts[user?.language || "en"]

  const menuItems = [
    { id: "overview", label: t.overview, icon: Activity },
    { id: "asha-workers", label: t.ashaWorkers, icon: Users },
    { id: "all-patients", label: t.allPatients, icon: Users },
    { id: "reports", label: t.reports, icon: FileText },
    { id: "sync", label: t.dataSync, icon: Database },
  ]

  const quickActions = [
    {
      title: t.reviewReports,
      description: "Review and approve ASHA worker reports",
      icon: FileText,
      action: () => setCurrentView("reports"),
      color: "bg-blue-500",
    },
    {
      title: t.manageWorkers,
      description: "Monitor ASHA worker performance",
      icon: Users,
      action: () => setCurrentView("asha-workers"),
      color: "bg-green-500",
    },
    {
      title: t.viewAllPatients,
      description: "View patients across all areas",
      icon: Users,
      action: () => setCurrentView("all-patients"),
      color: "bg-purple-500",
    },
    {
      title: t.syncData,
      description: "Sync data with central database",
      icon: Database,
      action: () => setCurrentView("sync"),
      color: "bg-orange-500",
    },
  ]

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return (
          <div className="space-y-6">
            <PHCStatsCards />

            <SyncStatusIndicator showDetails={true} className="w-full" />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  <Shield className="w-5 h-5 text-primary" />
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

            {/* Recent Reports Summary */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  <FileText className="w-5 h-5 text-primary" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReportsOverview limit={5} />
              </CardContent>
            </Card>
          </div>
        )

      case "asha-workers":
        return <AshaWorkersList />

      case "all-patients":
        return <AllPatientsList />

      case "reports":
        return <ReportsOverview />

      case "sync":
        return <DataSyncPanel />

      default:
        return <div>View not implemented</div>
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing system...</p>
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
                    <Shield className="w-5 h-5 text-primary" />
                    PHC Dashboard
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
                        setCurrentView(item.id as PHCDashboardView)
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
                {t.phcStaff}
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
              onClick={() => setCurrentView(item.id as PHCDashboardView)}
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
