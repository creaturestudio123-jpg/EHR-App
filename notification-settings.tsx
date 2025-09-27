"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { notificationService, type NotificationPermission } from "@/lib/notification-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Settings, AlertTriangle, CheckCircle } from "lucide-react"

export function NotificationSettings() {
  const { user } = useAuth()
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  })
  const [settings, setSettings] = useState({
    vaccinations: true,
    ancCheckups: true,
    followUps: true,
    dailyReminders: false,
    soundEnabled: true,
  })

  const texts = {
    en: {
      notificationSettings: "Notification Settings",
      permissions: "Permissions",
      preferences: "Preferences",
      enableNotifications: "Enable Notifications",
      notificationsEnabled: "Notifications Enabled",
      notificationsDisabled: "Notifications Disabled",
      requestPermission: "Request Permission",
      permissionDenied: "Permission Denied",
      vaccinations: "Vaccination Reminders",
      ancCheckups: "ANC Checkup Reminders",
      followUps: "Follow-up Reminders",
      dailyReminders: "Daily Summary",
      soundEnabled: "Sound Notifications",
      testNotification: "Test Notification",
      testSent: "Test notification sent!",
      vaccinationDesc: "Get notified about upcoming vaccinations",
      ancDesc: "Reminders for antenatal checkups",
      followUpDesc: "Follow-up appointment reminders",
      dailyDesc: "Daily summary of pending tasks",
      soundDesc: "Play sound with notifications",
    },
    hi: {
      notificationSettings: "सूचना सेटिंग्स",
      permissions: "अनुमतियां",
      preferences: "प्राथमिकताएं",
      enableNotifications: "सूचनाएं सक्षम करें",
      notificationsEnabled: "सूचनाएं सक्षम",
      notificationsDisabled: "सूचनाएं अक्षम",
      requestPermission: "अनुमति का अनुरोध",
      permissionDenied: "अनुमति अस्वीकृत",
      vaccinations: "टीकाकरण रिमाइंडर",
      ancCheckups: "एएनसी जांच रिमाइंडर",
      followUps: "फॉलो-अप रिमाइंडर",
      dailyReminders: "दैनिक सारांश",
      soundEnabled: "ध्वनि सूचनाएं",
      testNotification: "परीक्षण सूचना",
      testSent: "परीक्षण सूचना भेजी गई!",
      vaccinationDesc: "आगामी टीकाकरण के बारे में सूचना पाएं",
      ancDesc: "प्रसवपूर्व जांच के लिए रिमाइंडर",
      followUpDesc: "फॉलो-अप अपॉइंटमेंट रिमाइंडर",
      dailyDesc: "लंबित कार्यों का दैनिक सारांश",
      soundDesc: "सूचनाओं के साथ ध्वनि बजाएं",
    },
  }

  const t = texts[user?.language || "en"]

  useEffect(() => {
    checkPermission()
    loadSettings()
  }, [])

  const checkPermission = async () => {
    const perm = await notificationService.requestPermission()
    setPermission(perm)
  }

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem("notificationSettings")
      if (stored) {
        setSettings({ ...settings, ...JSON.parse(stored) })
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error)
    }
  }

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings)
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings))
  }

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission()
    setPermission(perm)
  }

  const handleTestNotification = async () => {
    await notificationService.showNotification({
      id: "test",
      title: "Test Notification",
      body: "This is a test notification from EHR Companion",
      scheduledTime: new Date(),
      type: "follow_up",
      patientId: "test",
      priority: "medium",
    })
  }

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
            <Settings className="w-5 h-5 text-primary" />
            {t.notificationSettings}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Status */}
          <div className="space-y-4">
            <h3 className={`text-lg font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>{t.permissions}</h3>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                {permission.granted ? (
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <BellOff className="w-5 h-5 text-red-600" />
                  </div>
                )}
                <div>
                  <p className={`font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    {permission.granted ? t.notificationsEnabled : t.notificationsDisabled}
                  </p>
                  <p className={`text-sm text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    {permission.denied ? t.permissionDenied : "Browser notification permission"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {permission.granted ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>
            </div>

            {!permission.granted && !permission.denied && (
              <Button
                onClick={handleRequestPermission}
                className={`w-full touch-target ${user?.language === "hi" ? "hindi-text" : ""}`}
              >
                <Bell className="w-4 h-4 mr-2" />
                {t.requestPermission}
              </Button>
            )}
          </div>

          {/* Notification Preferences */}
          {permission.granted && (
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>{t.preferences}</h3>

              <div className="space-y-4">
                {/* Vaccination Reminders */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <Label
                      htmlFor="vaccinations"
                      className={`text-base font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}
                    >
                      {t.vaccinations}
                    </Label>
                    <p className={`text-sm text-muted-foreground mt-1 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                      {t.vaccinationDesc}
                    </p>
                  </div>
                  <Switch
                    id="vaccinations"
                    checked={settings.vaccinations}
                    onCheckedChange={(checked) => handleSettingChange("vaccinations", checked)}
                  />
                </div>

                {/* ANC Checkups */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <Label
                      htmlFor="ancCheckups"
                      className={`text-base font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}
                    >
                      {t.ancCheckups}
                    </Label>
                    <p className={`text-sm text-muted-foreground mt-1 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                      {t.ancDesc}
                    </p>
                  </div>
                  <Switch
                    id="ancCheckups"
                    checked={settings.ancCheckups}
                    onCheckedChange={(checked) => handleSettingChange("ancCheckups", checked)}
                  />
                </div>

                {/* Follow-ups */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <Label
                      htmlFor="followUps"
                      className={`text-base font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}
                    >
                      {t.followUps}
                    </Label>
                    <p className={`text-sm text-muted-foreground mt-1 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                      {t.followUpDesc}
                    </p>
                  </div>
                  <Switch
                    id="followUps"
                    checked={settings.followUps}
                    onCheckedChange={(checked) => handleSettingChange("followUps", checked)}
                  />
                </div>

                {/* Daily Reminders */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <Label
                      htmlFor="dailyReminders"
                      className={`text-base font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}
                    >
                      {t.dailyReminders}
                    </Label>
                    <p className={`text-sm text-muted-foreground mt-1 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                      {t.dailyDesc}
                    </p>
                  </div>
                  <Switch
                    id="dailyReminders"
                    checked={settings.dailyReminders}
                    onCheckedChange={(checked) => handleSettingChange("dailyReminders", checked)}
                  />
                </div>

                {/* Sound Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <Label
                      htmlFor="soundEnabled"
                      className={`text-base font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}
                    >
                      {t.soundEnabled}
                    </Label>
                    <p className={`text-sm text-muted-foreground mt-1 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                      {t.soundDesc}
                    </p>
                  </div>
                  <Switch
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
                  />
                </div>
              </div>

              {/* Test Notification */}
              <Button
                variant="outline"
                onClick={handleTestNotification}
                className={`w-full touch-target bg-transparent ${user?.language === "hi" ? "hindi-text" : ""}`}
              >
                <Bell className="w-4 h-4 mr-2" />
                {t.testNotification}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
