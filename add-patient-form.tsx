"use client"

import type React from "react"

import { useState } from "react"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Save, X } from "lucide-react"

interface AddPatientFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AddPatientForm({ onSuccess, onCancel }: AddPatientFormProps) {
  const { addPatient } = useOfflineStorage()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    village: "",
  })

  const texts = {
    en: {
      addPatient: "Add New Patient",
      patientDetails: "Enter patient information",
      name: "Full Name",
      age: "Age",
      gender: "Gender",
      phone: "Phone Number",
      address: "Address",
      village: "Village",
      male: "Male",
      female: "Female",
      other: "Other",
      save: "Save Patient",
      cancel: "Cancel",
      saving: "Saving...",
      required: "Required",
      optional: "Optional",
      success: "Patient added successfully",
      error: "Failed to add patient",
    },
    hi: {
      addPatient: "नया मरीज़ जोड़ें",
      patientDetails: "मरीज़ की जानकारी दर्ज करें",
      name: "पूरा नाम",
      age: "उम्र",
      gender: "लिंग",
      phone: "फोन नंबर",
      address: "पता",
      village: "गांव",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      save: "मरीज़ सेव करें",
      cancel: "रद्द करें",
      saving: "सेव कर रहे हैं...",
      required: "आवश्यक",
      optional: "वैकल्पिक",
      success: "मरीज़ सफलतापूर्वक जोड़ा गया",
      error: "मरीज़ जोड़ने में असफल",
    },
  }

  const t = texts[user?.language || "en"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addPatient({
        name: formData.name.trim(),
        age: Number.parseInt(formData.age),
        gender: formData.gender as "male" | "female" | "other",
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim(),
        village: formData.village.trim(),
        ashaWorkerId: user?.id || "",
      })

      toast({
        title: t.success,
        description: `${formData.name} has been added to your patient list`,
      })

      onSuccess()
    } catch (error) {
      console.error("Error adding patient:", error)
      toast({
        title: t.error,
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
          <UserPlus className="w-5 h-5 text-primary" />
          {t.addPatient}
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>
          {t.patientDetails}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className={`text-base ${user?.language === "hi" ? "hindi-text" : ""}`}>
              {t.name} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter full name"
              className="h-12 touch-target"
              required
            />
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className={`text-base ${user?.language === "hi" ? "hindi-text" : ""}`}>
                {t.age} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="25"
                className="h-12 touch-target"
                min="0"
                max="120"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className={`text-base ${user?.language === "hi" ? "hindi-text" : ""}`}>
                {t.gender} <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} required>
                <SelectTrigger className="h-12 touch-target">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t.male}</SelectItem>
                  <SelectItem value="female">{t.female}</SelectItem>
                  <SelectItem value="other">{t.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className={`text-base ${user?.language === "hi" ? "hindi-text" : ""}`}>
              {t.phone} <span className="text-sm text-muted-foreground">({t.optional})</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="9876543210"
              className="h-12 touch-target"
            />
          </div>

          {/* Village */}
          <div className="space-y-2">
            <Label htmlFor="village" className={`text-base ${user?.language === "hi" ? "hindi-text" : ""}`}>
              {t.village} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="village"
              value={formData.village}
              onChange={(e) => handleInputChange("village", e.target.value)}
              placeholder="Enter village name"
              className="h-12 touch-target"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className={`text-base ${user?.language === "hi" ? "hindi-text" : ""}`}>
              {t.address} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter complete address"
              className="min-h-[80px] touch-target"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 h-12 touch-target">
              <Save className="w-4 h-4 mr-2" />
              <span className={user?.language === "hi" ? "hindi-text" : ""}>{loading ? t.saving : t.save}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-12 touch-target bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              <span className={user?.language === "hi" ? "hindi-text" : ""}>{t.cancel}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
