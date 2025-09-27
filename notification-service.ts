// Enhanced notification service for EHR reminders
export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  scheduledTime: Date
  type: "vaccination" | "anc" | "follow_up" | "medication"
  patientId: string
  priority: "low" | "medium" | "high"
  recurring?: {
    interval: "daily" | "weekly" | "monthly"
    count?: number
  }
}

class NotificationService {
  private registrations: ServiceWorkerRegistration[] = []
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map()

  async init(): Promise<void> {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      console.warn("Notifications not supported in this browser")
      return
    }

    try {
      // Register service worker for background notifications
      const registration = await navigator.serviceWorker.register("/sw.js")
      this.registrations.push(registration)
      console.log("Service worker registered for notifications")
    } catch (error) {
      console.error("Failed to register service worker:", error)
    }

    // Load scheduled notifications from localStorage
    this.loadScheduledNotifications()
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return { granted: false, denied: true, default: false }
    }

    let permission = Notification.permission

    if (permission === "default") {
      permission = await Notification.requestPermission()
    }

    return {
      granted: permission === "granted",
      denied: permission === "denied",
      default: permission === "default",
    }
  }

  async scheduleNotification(notification: Omit<ScheduledNotification, "id">): Promise<string> {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const scheduledNotification: ScheduledNotification = {
      ...notification,
      id,
    }

    this.scheduledNotifications.set(id, scheduledNotification)
    this.saveScheduledNotifications()

    // Schedule immediate notification if time has passed
    const now = new Date()
    if (scheduledNotification.scheduledTime <= now) {
      await this.showNotification(scheduledNotification)
    } else {
      // Schedule for future
      this.scheduleForFuture(scheduledNotification)
    }

    return id
  }

  private scheduleForFuture(notification: ScheduledNotification): void {
    const now = new Date()
    const delay = notification.scheduledTime.getTime() - now.getTime()

    if (delay > 0 && delay <= 2147483647) {
      // Max setTimeout delay
      setTimeout(() => {
        this.showNotification(notification)
      }, delay)
    }
  }

  async showNotification(notification: ScheduledNotification): Promise<void> {
    const permission = await this.requestPermission()
    if (!permission.granted) return

    const options: NotificationOptions = {
      body: notification.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: notification.id,
      requireInteraction: notification.priority === "high",
      data: {
        patientId: notification.patientId,
        type: notification.type,
        id: notification.id,
      },
      actions: [
        {
          action: "view",
          title: "View Details",
        },
        {
          action: "complete",
          title: "Mark Complete",
        },
      ],
    }

    // Use service worker for background notifications
    if (this.registrations.length > 0) {
      await this.registrations[0].showNotification(notification.title, options)
    } else {
      // Fallback to regular notification
      new Notification(notification.title, options)
    }

    // Handle recurring notifications
    if (notification.recurring) {
      this.scheduleRecurringNotification(notification)
    }
  }

  private scheduleRecurringNotification(notification: ScheduledNotification): void {
    if (!notification.recurring) return

    const { interval, count } = notification.recurring
    const nextTime = new Date(notification.scheduledTime)

    switch (interval) {
      case "daily":
        nextTime.setDate(nextTime.getDate() + 1)
        break
      case "weekly":
        nextTime.setDate(nextTime.getDate() + 7)
        break
      case "monthly":
        nextTime.setMonth(nextTime.getMonth() + 1)
        break
    }

    if (!count || count > 1) {
      const recurringNotification: ScheduledNotification = {
        ...notification,
        id: `${notification.id}_recurring_${Date.now()}`,
        scheduledTime: nextTime,
        recurring: count ? { ...notification.recurring, count: count - 1 } : notification.recurring,
      }

      this.scheduleNotification(recurringNotification)
    }
  }

  async cancelNotification(id: string): Promise<void> {
    this.scheduledNotifications.delete(id)
    this.saveScheduledNotifications()

    // Cancel from service worker
    if (this.registrations.length > 0) {
      const notifications = await this.registrations[0].getNotifications({ tag: id })
      notifications.forEach((notification) => notification.close())
    }
  }

  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values()).sort(
      (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime(),
    )
  }

  private loadScheduledNotifications(): void {
    try {
      const stored = localStorage.getItem("scheduledNotifications")
      if (stored) {
        const notifications = JSON.parse(stored)
        notifications.forEach((notification: any) => {
          notification.scheduledTime = new Date(notification.scheduledTime)
          this.scheduledNotifications.set(notification.id, notification)
        })
      }
    } catch (error) {
      console.error("Failed to load scheduled notifications:", error)
    }
  }

  private saveScheduledNotifications(): void {
    try {
      const notifications = Array.from(this.scheduledNotifications.values())
      localStorage.setItem("scheduledNotifications", JSON.stringify(notifications))
    } catch (error) {
      console.error("Failed to save scheduled notifications:", error)
    }
  }

  // Auto-generate reminders based on health records
  async generateVaccinationReminders(patientId: string, patientName: string, birthDate: Date): Promise<string[]> {
    const reminderIds: string[] = []

    // Standard vaccination schedule (simplified)
    const vaccinations = [
      { name: "BCG", ageInDays: 0, description: "BCG vaccination at birth" },
      { name: "OPV-1", ageInDays: 42, description: "First dose of Oral Polio Vaccine" },
      { name: "DPT-1", ageInDays: 42, description: "First dose of DPT vaccine" },
      { name: "OPV-2", ageInDays: 70, description: "Second dose of Oral Polio Vaccine" },
      { name: "DPT-2", ageInDays: 70, description: "Second dose of DPT vaccine" },
      { name: "OPV-3", ageInDays: 98, description: "Third dose of Oral Polio Vaccine" },
      { name: "DPT-3", ageInDays: 98, description: "Third dose of DPT vaccine" },
      { name: "Measles", ageInDays: 270, description: "Measles vaccination" },
    ]

    for (const vaccination of vaccinations) {
      const dueDate = new Date(birthDate)
      dueDate.setDate(dueDate.getDate() + vaccination.ageInDays)

      // Only schedule future vaccinations
      if (dueDate > new Date()) {
        const id = await this.scheduleNotification({
          title: `Vaccination Due: ${vaccination.name}`,
          body: `${patientName} is due for ${vaccination.description}`,
          scheduledTime: dueDate,
          type: "vaccination",
          patientId,
          priority: "high",
        })
        reminderIds.push(id)
      }
    }

    return reminderIds
  }

  async generateANCReminders(patientId: string, patientName: string, lastMenstrualPeriod: Date): Promise<string[]> {
    const reminderIds: string[] = []

    // ANC visit schedule
    const ancVisits = [
      { week: 12, description: "First ANC visit - Registration and initial checkup" },
      { week: 16, description: "Second ANC visit - Routine checkup" },
      { week: 20, description: "Third ANC visit - Ultrasound and checkup" },
      { week: 24, description: "Fourth ANC visit - Routine checkup" },
      { week: 28, description: "Fifth ANC visit - Routine checkup" },
      { week: 32, description: "Sixth ANC visit - Routine checkup" },
      { week: 36, description: "Seventh ANC visit - Pre-delivery checkup" },
      { week: 40, description: "Expected delivery date" },
    ]

    for (const visit of ancVisits) {
      const visitDate = new Date(lastMenstrualPeriod)
      visitDate.setDate(visitDate.getDate() + visit.week * 7)

      // Only schedule future visits
      if (visitDate > new Date()) {
        const id = await this.scheduleNotification({
          title: `ANC Visit Due - Week ${visit.week}`,
          body: `${patientName}: ${visit.description}`,
          scheduledTime: visitDate,
          type: "anc",
          patientId,
          priority: "high",
        })
        reminderIds.push(id)
      }
    }

    return reminderIds
  }

  async generateFollowUpReminder(
    patientId: string,
    patientName: string,
    followUpDate: Date,
    reason: string,
  ): Promise<string> {
    return await this.scheduleNotification({
      title: `Follow-up Required`,
      body: `${patientName}: ${reason}`,
      scheduledTime: followUpDate,
      type: "follow_up",
      patientId,
      priority: "medium",
    })
  }
}

// Singleton instance
export const notificationService = new NotificationService()

// Initialize when module loads
if (typeof window !== "undefined") {
  notificationService.init().catch(console.error)
}
