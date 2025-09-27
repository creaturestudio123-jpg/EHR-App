"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Smartphone, Lock, Heart, Wifi, WifiOff } from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"

export function LoginForm() {
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const { login } = useAuth()
  const { toast } = useToast()
  const isOnline = useOnlineStatus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const success = await login(phone, pin)

    if (success) {
      toast({
        title: language === "hi" ? "सफलतापूर्वक लॉग इन" : "Login Successful",
        description: language === "hi" ? "डैशबोर्ड में आपका स्वागत है" : "Welcome to your dashboard",
      })
    } else {
      toast({
        title: language === "hi" ? "लॉग इन असफल" : "Login Failed",
        description: language === "hi" ? "कृपया अपना फोन नंबर और पिन जांचें" : "Please check your phone number and PIN",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const texts = {
    en: {
      title: "EHR Companion",
      subtitle: "Healthcare Management for Rural Areas",
      phoneLabel: "Phone Number",
      pinLabel: "PIN",
      loginButton: "Login",
      demoCredentials: "Demo Credentials",
      ashaWorker: "ASHA Worker: 9876543210, PIN: 1234",
      phcStaff: "PHC Staff: 9876543211, PIN: 1234",
      offlineMode: "Offline Mode - Limited functionality",
    },
    hi: {
      title: "ईएचआर साथी",
      subtitle: "ग्रामीण क्षेत्रों के लिए स्वास्थ्य प्रबंधन",
      phoneLabel: "फोन नंबर",
      pinLabel: "पिन",
      loginButton: "लॉग इन करें",
      demoCredentials: "डेमो क्रेडेंशियल",
      ashaWorker: "आशा कार्यकर्ता: 9876543210, पिन: 1234",
      phcStaff: "पीएचसी स्टाफ: 9876543211, पिन: 1234",
      offlineMode: "ऑफलाइन मोड - सीमित कार्यक्षमता",
    },
  }

  const t = texts[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-4">
      {!isOnline && (
        <div className="offline-indicator">
          <WifiOff className="inline w-4 h-4 mr-2" />
          {t.offlineMode}
        </div>
      )}

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className={`text-2xl font-bold ${language === "hi" ? "hindi-text" : ""}`}>{t.title}</CardTitle>
            <CardDescription className={`mt-2 ${language === "hi" ? "hindi-text" : ""}`}>{t.subtitle}</CardDescription>
          </div>

          {/* Language Toggle */}
          <div className="flex justify-center gap-2">
            <Button
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
              className="touch-target"
            >
              English
            </Button>
            <Button
              variant={language === "hi" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("hi")}
              className="touch-target hindi-text"
            >
              हिंदी
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className={`text-base ${language === "hi" ? "hindi-text" : ""}`}>
                <Smartphone className="inline w-4 h-4 mr-2" />
                {t.phoneLabel}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="text-lg h-12 touch-target"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className={`text-base ${language === "hi" ? "hindi-text" : ""}`}>
                <Lock className="inline w-4 h-4 mr-2" />
                {t.pinLabel}
              </Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className="text-lg h-12 touch-target"
                maxLength={4}
                required
              />
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-lg touch-target ${language === "hi" ? "hindi-text" : ""}`}
              disabled={loading}
            >
              {loading ? "Loading..." : t.loginButton}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className={`font-medium mb-2 ${language === "hi" ? "hindi-text" : ""}`}>{t.demoCredentials}:</p>
            <p className={`text-muted-foreground ${language === "hi" ? "hindi-text" : ""}`}>{t.ashaWorker}</p>
            <p className={`text-muted-foreground ${language === "hi" ? "hindi-text" : ""}`}>{t.phcStaff}</p>
          </div>

          {/* Online Status */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-success" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-warning" />
                <span>Offline</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
