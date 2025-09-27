"use client"

import { useState } from "react"
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSync } from "@/hooks/use-sync"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface SyncStatusIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function SyncStatusIndicator({ className, showDetails = false }: SyncStatusIndicatorProps) {
  const { user } = useAuth()
  const { syncStatus, forceSync } = useSync()
  const { toast } = useToast()
  const [isForceSync, setIsForceSync] = useState(false)

  const texts = {
    en: {
      online: "Online",
      offline: "Offline",
      syncing: "Syncing...",
      synced: "All synced",
      pending: "items pending",
      failed: "items failed",
      lastSync: "Last sync",
      never: "Never",
      forceSync: "Sync now",
      syncSuccess: "Sync completed successfully",
      syncError: "Sync failed. Please try again.",
      ago: "ago",
      justNow: "just now",
    },
    hi: {
      online: "ऑनलाइन",
      offline: "ऑफलाइन",
      syncing: "सिंक हो रहा है...",
      synced: "सभी सिंक हो गए",
      pending: "आइटम बाकी हैं",
      failed: "आइटम असफल",
      lastSync: "अंतिम सिंक",
      never: "कभी नहीं",
      forceSync: "अभी सिंक करें",
      syncSuccess: "सिंक सफलतापूर्वक पूरा हुआ",
      syncError: "सिंक असफल। कृपया फिर से कोशिश करें।",
      ago: "पहले",
      justNow: "अभी",
    },
  }

  const t = texts[user?.language || "en"]

  const handleForceSync = async () => {
    if (!syncStatus.isOnline) {
      toast({
        title: "Error",
        description: "Cannot sync while offline",
        variant: "destructive",
      })
      return
    }

    setIsForceSync(true)
    try {
      await forceSync()
      toast({
        title: t.syncSuccess,
        description: `Synced ${syncStatus.pendingItems} items`,
      })
    } catch (error) {
      toast({
        title: t.syncError,
        description: "Please check your connection",
        variant: "destructive",
      })
    } finally {
      setIsForceSync(false)
    }
  }

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return t.never

    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t.justNow
    if (minutes < 60) return `${minutes}m ${t.ago}`
    if (hours < 24) return `${hours}h ${t.ago}`
    return `${days}d ${t.ago}`
  }

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />
    }

    if (syncStatus.isSyncing || isForceSync) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
    }

    if (syncStatus.failedItems > 0) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }

    if (syncStatus.pendingItems > 0) {
      return <Clock className="w-4 h-4 text-orange-500" />
    }

    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getStatusText = () => {
    if (!syncStatus.isOnline) return t.offline
    if (syncStatus.isSyncing || isForceSync) return t.syncing
    if (syncStatus.pendingItems === 0 && syncStatus.failedItems === 0) return t.synced
    return t.online
  }

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return "text-red-600"
    if (syncStatus.isSyncing || isForceSync) return "text-blue-600"
    if (syncStatus.failedItems > 0) return "text-yellow-600"
    if (syncStatus.pendingItems > 0) return "text-orange-600"
    return "text-green-600"
  }

  if (!showDetails) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {getStatusIcon()}
        <span className={cn("text-sm font-medium", getStatusColor(), user?.language === "hi" && "hindi-text")}>
          {getStatusText()}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("bg-white border rounded-lg p-4 space-y-3", className)}>
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={cn("font-medium", getStatusColor(), user?.language === "hi" && "hindi-text")}>
            {getStatusText()}
          </span>
        </div>

        {syncStatus.isOnline && (syncStatus.pendingItems > 0 || syncStatus.failedItems > 0) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleForceSync}
            disabled={isForceSync}
            className={user?.language === "hi" ? "hindi-text" : ""}
          >
            {isForceSync ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            {t.forceSync}
          </Button>
        )}
      </div>

      {/* Sync details */}
      <div className="space-y-2 text-sm text-muted-foreground">
        {syncStatus.pendingItems > 0 && (
          <div className={cn("flex items-center gap-2", user?.language === "hi" && "hindi-text")}>
            <Clock className="w-4 h-4 text-orange-500" />
            {syncStatus.pendingItems} {t.pending}
          </div>
        )}

        {syncStatus.failedItems > 0 && (
          <div className={cn("flex items-center gap-2", user?.language === "hi" && "hindi-text")}>
            <AlertCircle className="w-4 h-4 text-red-500" />
            {syncStatus.failedItems} {t.failed}
          </div>
        )}

        <div className={cn("flex items-center gap-2", user?.language === "hi" && "hindi-text")}>
          <Wifi className="w-4 h-4" />
          {t.lastSync}: {formatLastSync(syncStatus.lastSyncTime)}
        </div>
      </div>
    </div>
  )
}
