// Offline-first data storage using IndexedDB for EHR data
export interface Patient {
  id: string
  name: string
  age: number
  gender: "male" | "female" | "other"
  phone?: string
  address: string
  village: string
  ashaWorkerId: string
  createdAt: Date
  updatedAt: Date
  syncStatus: "pending" | "synced" | "conflict"
}

export interface HealthRecord {
  id: string
  patientId: string
  type: "vaccination" | "anc" | "general_checkup" | "follow_up"
  date: Date
  notes: string
  vitals?: {
    weight?: number
    height?: number
    bloodPressure?: string
    temperature?: number
  }
  vaccinations?: {
    vaccine: string
    dueDate: Date
    givenDate?: Date
    status: "due" | "given" | "overdue"
  }[]
  ancData?: {
    gestationWeeks: number
    nextVisitDate: Date
    complications?: string
  }
  recordedBy: string
  createdAt: Date
  updatedAt: Date
  syncStatus: "pending" | "synced" | "conflict"
}

export interface Reminder {
  id: string
  patientId: string
  type: "vaccination" | "anc" | "follow_up"
  title: string
  description: string
  dueDate: Date
  status: "pending" | "completed" | "overdue"
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

import { syncService } from "./sync-service"

class OfflineStorage {
  private db: IDBDatabase | null = null
  private readonly dbName = "EHRCompanionDB"
  private readonly dbVersion = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Patients store
        if (!db.objectStoreNames.contains("patients")) {
          const patientsStore = db.createObjectStore("patients", { keyPath: "id" })
          patientsStore.createIndex("ashaWorkerId", "ashaWorkerId", { unique: false })
          patientsStore.createIndex("village", "village", { unique: false })
          patientsStore.createIndex("syncStatus", "syncStatus", { unique: false })
        }

        // Health records store
        if (!db.objectStoreNames.contains("healthRecords")) {
          const recordsStore = db.createObjectStore("healthRecords", { keyPath: "id" })
          recordsStore.createIndex("patientId", "patientId", { unique: false })
          recordsStore.createIndex("type", "type", { unique: false })
          recordsStore.createIndex("date", "date", { unique: false })
          recordsStore.createIndex("syncStatus", "syncStatus", { unique: false })
        }

        // Reminders store
        if (!db.objectStoreNames.contains("reminders")) {
          const remindersStore = db.createObjectStore("reminders", { keyPath: "id" })
          remindersStore.createIndex("patientId", "patientId", { unique: false })
          remindersStore.createIndex("dueDate", "dueDate", { unique: false })
          remindersStore.createIndex("status", "status", { unique: false })
          remindersStore.createIndex("type", "type", { unique: false })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" })
          syncStore.createIndex("operation", "operation", { unique: false })
          syncStore.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  // Patient operations
  async addPatient(patient: Omit<Patient, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<Patient> {
    if (!this.db) throw new Error("Database not initialized")

    const newPatient: Patient = {
      ...patient,
      id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: "pending",
    }

    const transaction = this.db.transaction(["patients"], "readwrite")
    const patientsStore = transaction.objectStore("patients")

    await patientsStore.add(newPatient)

    syncService.addToSyncQueue({
      type: "patient",
      action: "create",
      data: newPatient,
    })

    return newPatient
  }

  async getPatients(ashaWorkerId?: string): Promise<Patient[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["patients"], "readonly")
    const store = transaction.objectStore("patients")

    if (ashaWorkerId) {
      const index = store.index("ashaWorkerId")
      const request = index.getAll(ashaWorkerId)
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } else {
      const request = store.getAll()
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["patients"], "readwrite")
    const patientsStore = transaction.objectStore("patients")

    const patient = await new Promise<Patient>((resolve, reject) => {
      const request = patientsStore.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    if (!patient) throw new Error("Patient not found")

    const updatedPatient: Patient = {
      ...patient,
      ...updates,
      updatedAt: new Date(),
      syncStatus: "pending",
    }

    await patientsStore.put(updatedPatient)

    syncService.addToSyncQueue({
      type: "patient",
      action: "update",
      data: updatedPatient,
    })

    return updatedPatient
  }

  // Health record operations
  async addHealthRecord(
    record: Omit<HealthRecord, "id" | "createdAt" | "updatedAt" | "syncStatus">,
  ): Promise<HealthRecord> {
    if (!this.db) throw new Error("Database not initialized")

    const newRecord: HealthRecord = {
      ...record,
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: "pending",
    }

    const transaction = this.db.transaction(["healthRecords"], "readwrite")
    const recordsStore = transaction.objectStore("healthRecords")

    await recordsStore.add(newRecord)

    syncService.addToSyncQueue({
      type: "health_record",
      action: "create",
      data: newRecord,
    })

    return newRecord
  }

  async getHealthRecords(patientId: string): Promise<HealthRecord[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["healthRecords"], "readonly")
    const store = transaction.objectStore("healthRecords")
    const index = store.index("patientId")

    const request = index.getAll(patientId)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const records = request.result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        resolve(records)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Reminder operations
  async addReminder(reminder: Omit<Reminder, "id" | "createdAt" | "updatedAt">): Promise<Reminder> {
    if (!this.db) throw new Error("Database not initialized")

    const newReminder: Reminder = {
      ...reminder,
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const transaction = this.db.transaction(["reminders"], "readwrite")
    const store = transaction.objectStore("reminders")
    await store.add(newReminder)

    syncService.addToSyncQueue({
      type: "reminder",
      action: "create",
      data: newReminder,
    })

    return newReminder
  }

  async getReminders(status?: "pending" | "completed" | "overdue"): Promise<Reminder[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["reminders"], "readonly")
    const store = transaction.objectStore("reminders")

    if (status) {
      const index = store.index("status")
      const request = index.getAll(status)
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } else {
      const request = store.getAll()
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const reminders = request.result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          resolve(reminders)
        }
        request.onerror = () => reject(request.error)
      })
    }
  }

  async updateReminderStatus(id: string, status: "pending" | "completed" | "overdue"): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["reminders"], "readwrite")
    const store = transaction.objectStore("reminders")

    const reminder = await new Promise<Reminder>((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    if (reminder) {
      reminder.status = status
      reminder.updatedAt = new Date()
      await store.put(reminder)
    }
  }

  // Sync operations
  async getPendingSyncItems(): Promise<any[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["syncQueue"], "readonly")
    const store = transaction.objectStore("syncQueue")

    const request = store.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["syncQueue"], "readwrite")
    const store = transaction.objectStore("syncQueue")
    await store.clear()
  }

  // Search functionality
  async searchPatients(query: string, ashaWorkerId?: string): Promise<Patient[]> {
    const patients = await this.getPatients(ashaWorkerId)
    const searchTerm = query.toLowerCase()

    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.phone?.includes(searchTerm) ||
        patient.village.toLowerCase().includes(searchTerm),
    )
  }

  // Statistics
  async getStats(ashaWorkerId?: string): Promise<{
    totalPatients: number
    pendingReminders: number
    overdueReminders: number
    recentRecords: number
    pendingSync: number
  }> {
    const patients = await this.getPatients(ashaWorkerId)
    const reminders = await this.getReminders()
    const syncItems = await this.getPendingSyncItems()

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Count recent records
    let recentRecords = 0
    for (const patient of patients) {
      const records = await this.getHealthRecords(patient.id)
      recentRecords += records.filter((r) => new Date(r.createdAt) > weekAgo).length
    }

    return {
      totalPatients: patients.length,
      pendingReminders: reminders.filter((r) => r.status === "pending").length,
      overdueReminders: reminders.filter((r) => r.status === "overdue").length,
      recentRecords,
      pendingSync: syncItems.length,
    }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage()

// Initialize storage when module loads
if (typeof window !== "undefined") {
  offlineStorage.init().catch(console.error)
}
