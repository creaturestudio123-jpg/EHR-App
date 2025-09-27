"use client"

import { useState, useEffect } from "react"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Users, FileText, Activity, Database, AlertTriangle } from "lucide-react"

export function PHCStatsCards() {
  const { getStats, getPendingSyncItems } = useOfflineStorage()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingReminders: 0,
    overdueReminders: 0,
    recentRecords: 0,
    pendingSync: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStats()
        setStats(data)
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [getStats])

  const texts = {
    en: {
      totalAshaWorkers: "ASHA Workers",
      totalPatients: "Total Patients",
      pendingReports: "Pending Reports",
      recentActivity: "Recent Activity",
      syncStatus: "Sync Status",
      active: "Active",
      thisWeek: "This week",
      needsReview: "Needs review",
      items: "items to sync",
    },
    hi: {
      totalAshaWorkers: "आशा कार्यकर्ता",
      totalPatients: "कुल मरीज़",
      pendingReports: "लंबित रिपोर्ट",
      recentActivity: "हाल की गतिविधि",
      syncStatus: "सिंक स्थिति",
      active: "सक्रिय",
      thisWeek: "इस सप्ताह",
      needsReview: "समीक्षा चाहिए",
      items: "सिंक करने के लिए आइटम",
    },
  }

  const t = texts[user?.language || "en"]

  // Mock data for PHC-specific stats
  const phcStatsData = [
    {
      title: t.totalAshaWorkers,
      value: 8, // Mock number of ASHA workers
      icon: Users,
      description: t.active,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: t.totalPatients,
      value: stats.totalPatients,
      icon: Users,
      description: "Across all areas",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: t.pendingReports,
      value: 12, // Mock pending reports
      icon: FileText,
      description: t.needsReview,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: t.recentActivity,
      value: stats.recentRecords,
      icon: Activity,
      description: t.thisWeek,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {phcStatsData.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}
                  >
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-xs text-muted-foreground mt-1 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    {stat.description}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync Status */}
      {stats.pendingSync > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className={`font-medium text-amber-800 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  {t.syncStatus}
                </p>
                <p className={`text-sm text-amber-700 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  {stats.pendingSync} {t.items}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Alerts */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className={`font-medium text-red-800 ${user?.language === "hi" ? "hindi-text" : ""}`}>System Alerts</p>
              <p className={`text-sm text-red-700 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                3 overdue vaccinations require immediate attention
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
