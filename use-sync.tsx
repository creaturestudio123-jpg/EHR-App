"use client"

import { useState, useEffect } from "react"
import { syncService, type SyncStatus } from "@/lib/sync-service"

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncService.getSyncStatus())

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncService.subscribe(setSyncStatus)

    // Initial status
    setSyncStatus(syncService.getSyncStatus())

    return unsubscribe
  }, [])

  const forceSync = async () => {
    try {
      await syncService.forcSync()
    } catch (error) {
      console.error("Force sync failed:", error)
      throw error
    }
  }

  const addToSyncQueue = (
    type: "patient" | "health_record" | "reminder",
    action: "create" | "update" | "delete",
    data: any,
  ) => {
    syncService.addToSyncQueue({ type, action, data })
  }

  return {
    syncStatus,
    forceSync,
    addToSyncQueue,
    clearSyncQueue: syncService.clearSyncQueue.bind(syncService),
    getSyncQueue: syncService.getSyncQueue.bind(syncService),
  }
}
