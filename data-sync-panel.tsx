"use client"

import { useState, useEffect } from "react"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Database, Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle, Clock } from "lucide-react"

export function DataSyncPanel() {
  const { getPendingSyncItems } = useOfflineStorage()
  const isOnline = useOnlineStatus()
  const { user } = useAuth()
  const [syncItems, setSyncItems] = useState<any[]>([])
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const texts = {
    en: {
      dataSync: "Data Synchronization",
      syncStatus: "Sync Status",
      pendingItems: "Pending Items",
      lastSync: "Last Sync",
      syncNow: "Sync Now",
      syncing: "Syncing...",
      syncComplete: "Sync Complete",
      syncFailed: "Sync Failed",
      online: "Online",
      offline: "Offline",
      noConnection: "No internet connection",
      itemsToSync: "items to sync",
      allSynced: "All data is synchronized",
      patients: "Patients",
      healthRecords: "Health Records",
      reminders: "Reminders",
      never: "Never",
      justNow: "Just now",
      minutesAgo: "minutes ago",
      hoursAgo: "hours ago",
      daysAgo: "days ago",
    },
    hi: {
      dataSync: "डेटा सिंक्रोनाइज़ेशन",
      syncStatus: "सिंक स्थिति",
      pendingItems: "लंबित आइटम",
      lastSync: "अंतिम सिंक",
      syncNow: "अभी सिंक करें",
      syncing: "सिंक हो रहा है...",
      syncComplete: "सिंक पूर्ण",
      syncFailed: "सिंक असफल",
      online: "ऑनलाइन",
      offline: "ऑफलाइन",
      noConnection: "कोई इंटरनेट कनेक्शन नहीं",
      itemsToSync: "सिंक करने के लिए आइटम",
      allSynced: "सभी डेटा सिंक्रोनाइज़ है",
      patients: "मरीज़",
      healthRecords: "स्वास्थ्य रिकॉर्ड",
      reminders: "रिमाइंडर",
      never: "कभी नहीं",
      justNow: "अभी",
      minutesAgo: "मिनट पहले",
      hoursAgo: "घंटे पहले",
      daysAgo: "दिन पहले",
    },
  }

  const t = texts[user?.language || "en"]

  useEffect(() => {
    loadSyncItems()
    // Load last sync time from localStorage
    const lastSync = localStorage.getItem("lastSyncTime")
    if (lastSync) {
      setLastSyncTime(new Date(lastSync))
    }
  }, [])

  const loadSyncItems = async () => {
    try {
      const items = await getPendingSyncItems()
      setSyncItems(items)
    } catch (error) {
      console.error("Error loading sync items:", error)
    }
  }

  const handleSync = async () => {
    if (!isOnline) return

    setSyncing(true)
    setSyncProgress(0)

    try {
      // Simulate sync process
      for (let i = 0; i <= 100; i += 10) {
        setSyncProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Clear sync items and update last sync time
      setSyncItems([])
      const now = new Date()
      setLastSyncTime(now)
      localStorage.setItem("lastSyncTime", now.toISOString())
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setSyncing(false)
      setSyncProgress(0)
    }
  }

  const getTimeSinceLastSync = () => {
    if (!lastSyncTime) return t.never

    const now = new Date()
    const diffMs = now.getTime() - lastSyncTime.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return t.justNow
    if (diffMinutes < 60) return `${diffMinutes} ${t.minutesAgo}`
    if (diffHours < 24) return `${diffHours} ${t.hoursAgo}`
    return `${diffDays} ${t.daysAgo}`
  }

  const getSyncItemsByType = () => {
    const grouped = syncItems.reduce((acc, item) => {
      const type = item.table || "unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return Object.entries(grouped).map(([type, count]) => ({
      type,
      count: count as number,
      label:
        type === "patients"
          ? t.patients
          : type === "healthRecords"
            ? t.healthRecords
            : type === "reminders"
              ? t.reminders
              : type,
    }))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
            <Database className="w-5 h-5 text-primary" />
            {t.dataSync}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <WifiOff className="w-5 h-5 text-red-600" />
                </div>
              )}
              <div>
                <p className={`font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  {isOnline ? t.online : t.offline}
                </p>
                <p className={`text-sm text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  {isOnline ? "Ready to sync" : t.noConnection}
                </p>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>{isOnline ? t.online : t.offline}</Badge>
          </div>

          {/* Sync Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>{t.syncStatus}</h3>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t.lastSync}: {getTimeSinceLastSync()}
              </Badge>
            </div>

            {syncing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    {t.syncing}
                  </span>
                  <span className="text-sm text-muted-foreground">{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="h-2" />
              </div>
            )}
          </div>

          {/* Pending Items */}
          <div className="space-y-4">
            <h3 className={`text-lg font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>{t.pendingItems}</h3>

            {syncItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className={`text-lg font-medium mb-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  {t.allSynced}
                </h4>
                <p className={`text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  All data is up to date
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className={`font-medium text-amber-800 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                        {syncItems.length} {t.itemsToSync}
                      </p>
                      <p className={`text-sm text-amber-700 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                        Data will sync when connection is available
                      </p>
                    </div>
                  </div>
                </div>

                {/* Breakdown by type */}
                <div className="grid gap-3">
                  {getSyncItemsByType().map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className={`font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>{item.label}</span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sync Button */}
          <Button
            onClick={handleSync}
            disabled={!isOnline || syncing || syncItems.length === 0}
            className={`w-full h-12 touch-target ${user?.language === "hi" ? "hindi-text" : ""}`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? t.syncing : t.syncNow}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
