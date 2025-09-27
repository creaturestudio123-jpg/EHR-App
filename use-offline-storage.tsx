"use client"

import { useState, useEffect } from "react"
import { offlineStorage, type Patient, type HealthRecord, type Reminder } from "@/lib/offline-storage"
import { useAuth } from "@/hooks/use-auth"

export function useOfflineStorage() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const initStorage = async () => {
      try {
        await offlineStorage.init()
        setIsInitialized(true)
      } catch (error) {
        console.error("Failed to initialize offline storage:", error)
      }
    }

    initStorage()
  }, [])

  const addPatient = async (patientData: Omit<Patient, "id" | "createdAt" | "updatedAt" | "syncStatus">) => {
    if (!user) throw new Error("User not authenticated")

    const patient = await offlineStorage.addPatient({
      ...patientData,
      ashaWorkerId: user.role === "asha_worker" ? user.id : patientData.ashaWorkerId,
    })

    return patient
  }

  const getPatients = async () => {
    if (!user) return []

    if (user.role === "asha_worker") {
      return await offlineStorage.getPatients(user.id)
    } else {
      return await offlineStorage.getPatients()
    }
  }

  const addHealthRecord = async (recordData: Omit<HealthRecord, "id" | "createdAt" | "updatedAt" | "syncStatus">) => {
    if (!user) throw new Error("User not authenticated")

    return await offlineStorage.addHealthRecord({
      ...recordData,
      recordedBy: user.id,
    })
  }

  const getHealthRecords = async (patientId: string) => {
    return await offlineStorage.getHealthRecords(patientId)
  }

  const addReminder = async (reminderData: Omit<Reminder, "id" | "createdAt" | "updatedAt">) => {
    if (!user) throw new Error("User not authenticated")

    return await offlineStorage.addReminder({
      ...reminderData,
      createdBy: user.id,
    })
  }

  const getReminders = async (status?: "pending" | "completed" | "overdue") => {
    return await offlineStorage.getReminders(status)
  }

  const updateReminderStatus = async (id: string, status: "pending" | "completed" | "overdue") => {
    return await offlineStorage.updateReminderStatus(id, status)
  }

  const searchPatients = async (query: string) => {
    if (!user) return []

    const ashaWorkerId = user.role === "asha_worker" ? user.id : undefined
    return await offlineStorage.searchPatients(query, ashaWorkerId)
  }

  const getStats = async () => {
    if (!user)
      return {
        totalPatients: 0,
        pendingReminders: 0,
        overdueReminders: 0,
        recentRecords: 0,
        pendingSync: 0,
      }

    const ashaWorkerId = user.role === "asha_worker" ? user.id : undefined
    return await offlineStorage.getStats(ashaWorkerId)
  }

  const getPendingSyncItems = async () => {
    return await offlineStorage.getPendingSyncItems()
  }

  return {
    isInitialized,
    addPatient,
    getPatients,
    addHealthRecord,
    getHealthRecords,
    addReminder,
    getReminders,
    updateReminderStatus,
    searchPatients,
    getStats,
    getPendingSyncItems,
    updatePatient: offlineStorage.updatePatient.bind(offlineStorage),
  }
}
