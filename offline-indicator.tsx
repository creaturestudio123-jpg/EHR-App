"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { Wifi, WifiOff, Database, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const { getPendingSyncItems } = useOfflineStorage()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const items = await getPendingSyncItems()
        setPendingCount(items.length)
      } catch (error) {
        console.error("Error getting pending sync items:", error)
      }
    }

    updatePendingCount()

    // Update every 30 seconds
    const interval = setInterval(updatePendingCount, 30000)
    return () => clearInterval(interval)
  }, [getPendingSyncItems])

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="w-4 h-4" />
          <span>Online</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-amber-600">
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </div>
      )}

      {pendingCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          {pendingCount} pending sync
        </Badge>
      )}

      {!isOnline && (
        <div className="flex items-center gap-1 text-blue-600">
          <AlertCircle className="w-4 h-4" />
          <span>Data stored locally</span>
        </div>
      )}
    </div>
  )
}
