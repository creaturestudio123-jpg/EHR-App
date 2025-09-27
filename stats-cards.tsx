"use client"

import { useState, useEffect } from "react"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Bell, AlertTriangle, Activity, Database } from "lucide-react"

export function StatsCards() {
  const { getStats } = useOfflineStorage()
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
      totalPatients: "Total Patients",
      pendingReminders: "Pending Reminders",
      overdueReminders: "Overdue Reminders",
      recentRecords: "Recent Records",
      pendingSync: "Pending Sync",
      thisWeek: "This week",
      needsAttention: "Needs attention",
      upToDate: "Up to date",
      items: "items",
    },
    hi: {
      totalPatients: "कुल मरीज़",
      pendingReminders: "लंबित रिमाइंडर",
      overdueReminders: "देर से रिमाइंडर",
      recentRecords: "हाल के रिकॉर्ड",
      pendingSync: "लंबित सिंक",
      thisWeek: "इस सप्ताह",
      needsAttention: "ध्यान चाहिए",
      upToDate: "अप टू डेट",
      items: "आइटम",
    },
  }

  const t = texts[user?.language || "en"]

  const statsData = [
    {
      title: t.totalPatients,
      value: stats.totalPatients,
      icon: Users,
      description: t.upToDate,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: t.pendingReminders,
      value: stats.pendingReminders,
      icon: Bell,
      description: t.needsAttention,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: t.overdueReminders,
      value: stats.overdueReminders,
      icon: AlertTriangle,
      description: t.needsAttention,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: t.recentRecords,
      value: stats.recentRecords,
      icon: Activity,
      description: t.thisWeek,
      color: "text-green-600",
      bgColor: "bg-green-50",
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
        {statsData.map((stat, index) => (
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
                  {t.pendingSync}
                </p>
                <p className={`text-sm text-amber-700 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  {stats.pendingSync} {t.items} waiting to sync when online
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
