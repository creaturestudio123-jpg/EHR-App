"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { notificationService } from "@/lib/notification-service"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Plus, Zap, Baby, Syringe } from "lucide-react"

export function SmartReminderGenerator() {
  const { user } = useAuth()
  const { getPatients, addReminder } = useOfflineStorage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<any[]>([])

  const [formData, setFormData] = useState({
    type: "",
    patientId: "",
    customTitle: "",
    customDescription: "",
    dueDate: "",
    priority: "medium",
  })

  const texts = {
    en: {
      smartReminders: "Smart Reminder Generator",
      generateReminders: "Generate automatic reminders based on patient data",
      reminderType: "Reminder Type",
      selectType: "Select reminder type",
      vaccinationSchedule: "Vaccination Schedule",
      ancSchedule: "ANC Schedule",
      customReminder: "Custom Reminder",
      selectPatient: "Select Patient",
      patientRequired: "Please select a patient",
      title: "Title",
      description: "Description",
      dueDate: "Due Date",
      priority: "Priority",
      low: "Low",
      medium: "Medium",
      high: "High",
      generate: "Generate Reminders",
      generating: "Generating...",
      success: "Reminders generated successfully",
      error: "Failed to generate reminders",
      vaccinationDesc: "Generate vaccination reminders based on child's birth date",
      ancDesc: "Generate ANC visit reminders based on last menstrual period",
      customDesc: "Create a custom reminder for specific needs",
    },
    hi: {
      smartReminders: "स्मार्ट रिमाइंडर जेनरेटर",
      generateReminders: "मरीज़ के डेटा के आधार पर स्वचालित रिमाइंडर बनाएं",
      reminderType: "रिमाइंडर प्रकार",
      selectType: "रिमाइंडर प्रकार चुनें",
      vaccinationSchedule: "टीकाकरण अनुसूची",
      ancSchedule: "एएनसी अनुसूची",
      customReminder: "कस्टम रिमाइंडर",
      selectPatient: "मरीज़ चुनें",
      patientRequired: "कृपया एक मरीज़ चुनें",
      title: "शीर्षक",
      description: "विवरण",
      dueDate: "देय तिथि",
      priority: "प्राथमिकता",
      low: "कम",
      medium: "मध्यम",
      high: "उच्च",
      generate: "रिमाइंडर बनाएं",
      generating: "बना रहे हैं...",
      success: "रिमाइंडर सफलतापूर्वक बनाए गए",
      error: "रिमाइंडर बनाने में असफल",
      vaccinationDesc: "बच्चे की जन्म तिथि के आधार पर टीकाकरण रिमाइंडर बनाएं",
      ancDesc: "अंतिम मासिक धर्म के आधार पर एएनसी विज़िट रिमाइंडर बनाएं",
      customDesc: "विशिष्ट आवश्यकताओं के लिए कस्टम रिमाइंडर बनाएं",
    },
  }

  const t = texts[user?.language || "en"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.patientId) {
      toast({
        title: "Error",
        description: t.patientRequired,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Load patients if not already loaded
      if (patients.length === 0) {
        const patientList = await getPatients()
        setPatients(patientList)
      }

      const selectedPatient = patients.find((p) => p.id === formData.patientId)
      if (!selectedPatient) throw new Error("Patient not found")

      let reminderIds: string[] = []

      switch (formData.type) {
        case "vaccination":
          // Generate vaccination schedule based on birth date
          const birthDate = new Date()
          birthDate.setFullYear(birthDate.getFullYear() - selectedPatient.age)
          reminderIds = await notificationService.generateVaccinationReminders(
            selectedPatient.id,
            selectedPatient.name,
            birthDate,
          )
          break

        case "anc":
          // Generate ANC schedule (mock LMP date)
          const lmpDate = new Date()
          lmpDate.setDate(lmpDate.getDate() - 60) // 8-9 weeks pregnant
          reminderIds = await notificationService.generateANCReminders(
            selectedPatient.id,
            selectedPatient.name,
            lmpDate,
          )
          break

        case "custom":
          // Create custom reminder
          const customReminder = await addReminder({
            patientId: formData.patientId,
            type: "follow_up",
            title: formData.customTitle,
            description: formData.customDescription,
            dueDate: new Date(formData.dueDate),
            status: "pending",
            createdBy: user?.id || "",
          })

          // Schedule notification
          const notificationId = await notificationService.scheduleNotification({
            title: formData.customTitle,
            body: formData.customDescription,
            scheduledTime: new Date(formData.dueDate),
            type: "follow_up",
            patientId: formData.patientId,
            priority: formData.priority as "low" | "medium" | "high",
          })

          reminderIds = [notificationId]
          break
      }

      toast({
        title: t.success,
        description: `Generated ${reminderIds.length} reminders for ${selectedPatient.name}`,
      })

      // Reset form
      setFormData({
        type: "",
        patientId: "",
        customTitle: "",
        customDescription: "",
        dueDate: "",
        priority: "medium",
      })
    } catch (error) {
      console.error("Error generating reminders:", error)
      toast({
        title: t.error,
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadPatients = async () => {
    if (patients.length === 0) {
      try {
        const patientList = await getPatients()
        setPatients(patientList)
      } catch (error) {
        console.error("Error loading patients:", error)
      }
    }
  }

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return Syringe
      case "anc":
        return Baby
      case "custom":
        return Plus
      default:
        return Calendar
    }
  }

  const getReminderTypeDescription = (type: string) => {
    switch (type) {
      case "vaccination":
        return t.vaccinationDesc
      case "anc":
        return t.ancDesc
      case "custom":
        return t.customDesc
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
          <Zap className="w-5 h-5 text-primary" />
          {t.smartReminders}
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>
          {t.generateReminders}
        </p>
      </CardHeader>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
              {t.reminderType}
            </label>
            <div className="grid grid-cols-1 gap-3">
              {["vaccination", "anc", "custom"].map((type) => {
                const Icon = getReminderTypeIcon(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, type })
                      if (type !== "custom") loadPatients()
                    }}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.type === type ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className={`font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                          {type === "vaccination" && t.vaccinationSchedule}
                          {type === "anc" && t.ancSchedule}
                          {type === "custom" && t.customReminder}
                        </h3>
                        <p
                          className={`text-sm text-muted-foreground mt-1 ${user?.language === "hi" ? "hindi-text" : ""}`}
                        >
                          {getReminderTypeDescription(type)}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {formData.type && formData.type !== "custom" && (
            <div className="space-y-2">
              <label className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                {t.selectPatient}
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className={`w-full p-3 border rounded-lg ${user?.language === "hi" ? "hindi-text" : ""}`}
                required
              >
                <option value="">{t.selectPatient}</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.age} years
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.type === "custom" && (
            <>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  {t.selectPatient}
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  onFocus={loadPatients}
                  className={`w-full p-3 border rounded-lg ${user?.language === "hi" ? "hindi-text" : ""}`}
                  required
                >
                  <option value="">{t.selectPatient}</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.age} years
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  {t.title}
                </label>
                <input
                  type="text"
                  value={formData.customTitle}
                  onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                  className={`w-full p-3 border rounded-lg ${user?.language === "hi" ? "hindi-text" : ""}`}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  {t.description}
                </label>
                <textarea
                  value={formData.customDescription}
                  onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
                  className={`w-full p-3 border rounded-lg h-24 resize-none ${user?.language === "hi" ? "hindi-text" : ""}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    {t.dueDate}
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`w-full p-3 border rounded-lg ${user?.language === "hi" ? "hindi-text" : ""}`}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    {t.priority}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className={`w-full p-3 border rounded-lg ${user?.language === "hi" ? "hindi-text" : ""}`}
                  >
                    <option value="low">{t.low}</option>
                    <option value="medium">{t.medium}</option>
                    <option value="high">{t.high}</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {formData.type && (
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed ${user?.language === "hi" ? "hindi-text" : ""}`}
            >
              {loading ? t.generating : t.generate}
            </button>
          )}
        </form>
      </div>
    </Card>
  )
}
