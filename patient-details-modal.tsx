"use client"

import { useState, useEffect } from "react"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { useAuth } from "@/hooks/use-auth"
import type { Patient, HealthRecord } from "@/lib/offline-storage"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Phone, MapPin, Activity, Syringe, Baby, FileText, Plus } from "lucide-react"
import { format } from "date-fns"

interface PatientDetailsModalProps {
  patient: Patient
  open: boolean
  onClose: () => void
}

export function PatientDetailsModal({ patient, open, onClose }: PatientDetailsModalProps) {
  const { getHealthRecords } = useOfflineStorage()
  const { user } = useAuth()
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)

  const texts = {
    en: {
      patientDetails: "Patient Details",
      overview: "Overview",
      records: "Health Records",
      basicInfo: "Basic Information",
      contactInfo: "Contact Information",
      recentRecords: "Recent Health Records",
      noRecords: "No health records found",
      addRecord: "Add Health Record",
      male: "Male",
      female: "Female",
      other: "Other",
      years: "years old",
      vaccination: "Vaccination",
      anc: "ANC Checkup",
      generalCheckup: "General Checkup",
      followUp: "Follow-up",
      recordedBy: "Recorded by",
      vitals: "Vitals",
      weight: "Weight",
      height: "Height",
      bloodPressure: "Blood Pressure",
      temperature: "Temperature",
      notes: "Notes",
    },
    hi: {
      patientDetails: "मरीज़ का विवरण",
      overview: "अवलोकन",
      records: "स्वास्थ्य रिकॉर्ड",
      basicInfo: "बुनियादी जानकारी",
      contactInfo: "संपर्क जानकारी",
      recentRecords: "हाल के स्वास्थ्य रिकॉर्ड",
      noRecords: "कोई स्वास्थ्य रिकॉर्ड नहीं मिला",
      addRecord: "स्वास्थ्य रिकॉर्ड जोड़ें",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      years: "साल का",
      vaccination: "टीकाकरण",
      anc: "एएनसी जांच",
      generalCheckup: "सामान्य जांच",
      followUp: "फॉलो-अप",
      recordedBy: "द्वारा रिकॉर्ड किया गया",
      vitals: "वाइटल्स",
      weight: "वजन",
      height: "ऊंचाई",
      bloodPressure: "रक्तचाप",
      temperature: "तापमान",
      notes: "नोट्स",
    },
  }

  const t = texts[user?.language || "en"]

  useEffect(() => {
    if (open && patient) {
      loadHealthRecords()
    }
  }, [open, patient])

  const loadHealthRecords = async () => {
    try {
      setLoading(true)
      const records = await getHealthRecords(patient.id)
      setHealthRecords(records)
    } catch (error) {
      console.error("Error loading health records:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case "male":
        return t.male
      case "female":
        return t.female
      default:
        return t.other
    }
  }

  const getRecordTypeText = (type: string) => {
    switch (type) {
      case "vaccination":
        return t.vaccination
      case "anc":
        return t.anc
      case "general_checkup":
        return t.generalCheckup
      case "follow_up":
        return t.followUp
      default:
        return type
    }
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return Syringe
      case "anc":
        return Baby
      case "general_checkup":
        return Activity
      case "follow_up":
        return FileText
      default:
        return FileText
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-3 ${user?.language === "hi" ? "hindi-text" : ""}`}>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            {patient.name}
          </DialogTitle>
          <DialogDescription className={user?.language === "hi" ? "hindi-text" : ""}>
            {t.patientDetails}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className={user?.language === "hi" ? "hindi-text" : ""}>
              {t.overview}
            </TabsTrigger>
            <TabsTrigger value="records" className={user?.language === "hi" ? "hindi-text" : ""}>
              {t.records}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  <User className="w-4 h-4" />
                  {t.basicInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Age:</span>
                  <Badge variant="secondary">
                    {patient.age} {t.years}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gender:</span>
                  <span>{getGenderText(patient.gender)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Village:</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {patient.village}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  <Phone className="w-4 h-4" />
                  {t.contactInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {patient.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="text-right max-w-[200px]">{patient.address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Records Summary */}
            <Card>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                  <Activity className="w-4 h-4" />
                  {t.recentRecords}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : healthRecords.length > 0 ? (
                  <div className="space-y-3">
                    {healthRecords.slice(0, 3).map((record) => {
                      const Icon = getRecordIcon(record.type)
                      return (
                        <div key={record.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <Icon className="w-4 h-4 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{getRecordTypeText(record.type)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(record.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p
                    className={`text-muted-foreground text-center py-4 ${user?.language === "hi" ? "hindi-text" : ""}`}
                  >
                    {t.noRecords}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
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
            ) : healthRecords.length > 0 ? (
              <div className="space-y-4">
                {healthRecords.map((record) => {
                  const Icon = getRecordIcon(record.type)
                  return (
                    <Card key={record.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            {getRecordTypeText(record.type)}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(record.date), "MMM dd, yyyy")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        {record.notes && (
                          <div>
                            <p className={`text-sm font-medium mb-1 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                              {t.notes}:
                            </p>
                            <p className="text-sm text-muted-foreground">{record.notes}</p>
                          </div>
                        )}

                        {record.vitals && (
                          <div>
                            <p className={`text-sm font-medium mb-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                              {t.vitals}:
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {record.vitals.weight && (
                                <div>
                                  <span className="text-muted-foreground">{t.weight}:</span> {record.vitals.weight}kg
                                </div>
                              )}
                              {record.vitals.height && (
                                <div>
                                  <span className="text-muted-foreground">{t.height}:</span> {record.vitals.height}cm
                                </div>
                              )}
                              {record.vitals.bloodPressure && (
                                <div>
                                  <span className="text-muted-foreground">{t.bloodPressure}:</span>{" "}
                                  {record.vitals.bloodPressure}
                                </div>
                              )}
                              {record.vitals.temperature && (
                                <div>
                                  <span className="text-muted-foreground">{t.temperature}:</span>{" "}
                                  {record.vitals.temperature}°F
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className={`text-lg font-medium mb-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    {t.noRecords}
                  </h3>
                  <Button className={`mt-4 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t.addRecord}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
