export interface SyncQueueItem {
  id: string
  type: "patient" | "health_record" | "reminder"
  action: "create" | "update" | "delete"
  data: any
  timestamp: number
  retryCount: number
  status: "pending" | "syncing" | "completed" | "failed"
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  pendingItems: number
  failedItems: number
  totalSynced: number
}

class SyncService {
  private syncQueue: SyncQueueItem[] = []
  private isOnline = false
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private listeners: ((status: SyncStatus) => void)[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeSync()
    }
  }

  private initializeSync() {
    // Load sync queue from localStorage
    this.loadSyncQueue()

    // Monitor online status
    this.isOnline = navigator.onLine
    window.addEventListener("online", this.handleOnline.bind(this))
    window.addEventListener("offline", this.handleOffline.bind(this))

    // Start periodic sync when online
    if (this.isOnline) {
      this.startPeriodicSync()
    }
  }

  private loadSyncQueue() {
    try {
      const stored = localStorage.getItem("ehr_sync_queue")
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Error loading sync queue:", error)
      this.syncQueue = []
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem("ehr_sync_queue", JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error("Error saving sync queue:", error)
    }
  }

  private handleOnline() {
    this.isOnline = true
    this.notifyListeners()
    this.startPeriodicSync()
    // Trigger immediate sync when coming online
    setTimeout(() => this.syncPendingItems(), 1000)
  }

  private handleOffline() {
    this.isOnline = false
    this.stopPeriodicSync()
    this.notifyListeners()
  }

  private startPeriodicSync() {
    if (this.syncInterval) return

    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing && this.syncQueue.length > 0) {
        this.syncPendingItems()
      }
    }, 30000)
  }

  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Add item to sync queue
  addToSyncQueue(item: Omit<SyncQueueItem, "id" | "timestamp" | "retryCount" | "status">) {
    const syncItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    }

    this.syncQueue.push(syncItem)
    this.saveSyncQueue()
    this.notifyListeners()

    // Try immediate sync if online
    if (this.isOnline && !this.isSyncing) {
      setTimeout(() => this.syncPendingItems(), 100)
    }
  }

  // Sync pending items
  async syncPendingItems() {
    if (!this.isOnline || this.isSyncing || this.syncQueue.length === 0) {
      return
    }

    this.isSyncing = true
    this.notifyListeners()

    const pendingItems = this.syncQueue.filter(
      (item) => item.status === "pending" || (item.status === "failed" && item.retryCount < 3),
    )

    for (const item of pendingItems) {
      try {
        item.status = "syncing"
        this.notifyListeners()

        // Simulate API call (replace with actual API endpoint)
        await this.syncItem(item)

        // Mark as completed
        item.status = "completed"

        // Remove completed items from queue
        this.syncQueue = this.syncQueue.filter((queueItem) => queueItem.id !== item.id)
      } catch (error) {
        console.error("Sync error for item:", item.id, error)
        item.status = "failed"
        item.retryCount++

        // Remove items that have failed too many times
        if (item.retryCount >= 3) {
          this.syncQueue = this.syncQueue.filter((queueItem) => queueItem.id !== item.id)
        }
      }
    }

    this.isSyncing = false
    this.saveSyncQueue()
    this.notifyListeners()

    // Update last sync time
    localStorage.setItem("ehr_last_sync", Date.now().toString())
  }

  // Simulate API sync (replace with actual implementation)
  private async syncItem(item: SyncQueueItem): Promise<void> {
    try {
      // Simulate network delay for realistic behavior
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

      // In a real implementation, this would make actual API calls
      // For now, we'll simulate successful sync without artificial failures
      console.log(`[v0] [SYNC] Successfully synced ${item.action} ${item.type}:`, item.data)

      // Update total synced count
      const currentTotal = Number.parseInt(localStorage.getItem("ehr_total_synced") || "0")
      localStorage.setItem("ehr_total_synced", (currentTotal + 1).toString())
    } catch (error) {
      console.error(`[v0] [SYNC] Real network error for item ${item.id}:`, error)
      throw error
    }
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    const lastSyncTime = localStorage.getItem("ehr_last_sync")

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: lastSyncTime ? Number.parseInt(lastSyncTime) : null,
      pendingItems: this.syncQueue.filter((item) => item.status === "pending").length,
      failedItems: this.syncQueue.filter((item) => item.status === "failed").length,
      totalSynced: Number.parseInt(localStorage.getItem("ehr_total_synced") || "0"),
    }
  }

  // Subscribe to sync status changes
  subscribe(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    const status = this.getSyncStatus()
    this.listeners.forEach((listener) => listener(status))
  }

  // Force sync
  async forcSync() {
    if (!this.isOnline) {
      throw new Error("Cannot sync while offline")
    }

    await this.syncPendingItems()
  }

  // Clear sync queue (for testing/reset)
  clearSyncQueue() {
    this.syncQueue = []
    this.saveSyncQueue()
    this.notifyListeners()
  }

  // Get sync queue for debugging
  getSyncQueue() {
    return [...this.syncQueue]
  }
}

export const syncService = new SyncService()
