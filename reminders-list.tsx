"use client"

import { useState, useEffect } from "react"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { useAuth } from "@/hooks/use-auth"
import type { Reminder } from "@/lib/offline-storage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, CheckCircle, Syringe, Baby, FileText } from "lucide-react"
import { format, isBefore, addDays } from "date-fns"

interface RemindersListProps {
  limit?: number
}

export function RemindersList({ limit }: RemindersListProps) {
  const { getReminders, updateReminderStatus } = useOfflineStorage()
  const { user } = useAuth()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  const texts = {
    en: {
      reminders: "Reminders",
      noReminders: "No reminders found",
      allCaughtUp: "You're all caught up!",
      markComplete: "Mark Complete",
      overdue: "Overdue",
      dueToday: "Due Today",
      dueSoon: "Due Soon",
      pending: "Pending",
      completed: "Completed",
      vaccination: "Vaccination",
      anc: "ANC Checkup",
      followUp: "Follow-up",
      dueOn: "Due on",
      completedOn: "Completed on",
    },
    hi: {
      reminders: "रिमाइंडर",
      noReminders: "कोई रिमाइंडर नहीं मिला",
      allCaughtUp: "आप सभी काम पूरे कर चुके हैं!",
      markComplete: "पूर्ण चिह्नित करें",
      overdue: "देर से",
      dueToday: "आज देय",
      dueSoon: "जल्द देय",
      pending: "लंबित",
      completed: "पूर्ण",
      vaccination: "टीकाकरण",
      anc: "एएनसी जांच",
      followUp: "फॉलो-अप",
      dueOn: "देय तिथि",
      completedOn: "पूर्ण तिथि",
    },
  }

  const t = texts[user?.language || "en"]

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    try {
      const data = await getReminders()
      const sortedReminders = data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      setReminders(limit ? sortedReminders.slice(0, limit) : sortedReminders)
    } catch (error) {
      console.error("Error loading reminders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async (reminderId: string) => {
    try {
      await updateReminderStatus(reminderId, "completed")
      await loadReminders() // Refresh the list
    } catch (error) {
      console.error("Error updating reminder:", error)
    }
  }

  const getReminderStatus = (reminder: Reminder) => {
    const now = new Date()
    const dueDate = new Date(reminder.dueDate)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

    if (reminder.status === "completed") {
      return { status: "completed", label: t.completed, color: "bg-green-100 text-green-800" }
    }

    if (isBefore(dueDateOnly, today)) {
      return { status: "overdue", label: t.overdue, color: "bg-red-100 text-red-800" }
    }

    if (dueDateOnly.getTime() === today.getTime()) {
      return { status: "due-today", label: t.dueToday, color: "bg-orange-100 text-orange-800" }
    }

    if (isBefore(dueDateOnly, addDays(today, 7))) {
      return { status: "due-soon", label: t.dueSoon, color: "bg-yellow-100 text-yellow-800" }
    }

    return { status: "pending", label: t.pending, color: "bg-blue-100 text-blue-800" }
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return Syringe
      case "anc":
        return Baby
      case "follow_up":
        return FileText
      default:
        return Bell
    }
  }

  const getReminderTypeText = (type: string) => {
    switch (type) {
      case "vaccination":
        return t.vaccination
      case "anc":
        return t.anc
      case "follow_up":
        return t.followUp
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className={`text-lg font-medium mb-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>{t.allCaughtUp}</h3>
          <p className={`text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>{t.noReminders}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        const status = getReminderStatus(reminder)
        const Icon = getReminderIcon(reminder.type)

        return (
          <Card key={reminder.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>{reminder.title}</h3>
                    <Badge className={`text-xs ${status.color} border-0`}>{status.label}</Badge>
                  </div>

                  <p className={`text-sm text-muted-foreground mb-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    {reminder.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {reminder.status === "completed" ? t.completedOn : t.dueOn}:{" "}
                        {format(new Date(reminder.dueDate), "MMM dd, yyyy")}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getReminderTypeText(reminder.type)}
                      </Badge>
                    </div>

                    {reminder.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkComplete(reminder.id)}
                        className={`touch-target ${user?.language === "hi" ? "hindi-text" : ""}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t.markComplete}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
