"use client"

import { useState, useEffect } from "react"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { useAuth } from "@/hooks/use-auth"
import type { Patient } from "@/lib/offline-storage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Phone, MapPin, User } from "lucide-react"
import { PatientDetailsModal } from "./patient-details-modal"

export function PatientList() {
  const { getPatients, searchPatients } = useOfflineStorage()
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const texts = {
    en: {
      patients: "Patients",
      searchPlaceholder: "Search patients...",
      noPatients: "No patients found",
      addFirstPatient: "Add your first patient to get started",
      male: "Male",
      female: "Female",
      other: "Other",
      years: "years",
      viewDetails: "View Details",
    },
    hi: {
      patients: "मरीज़",
      searchPlaceholder: "मरीज़ खोजें...",
      noPatients: "कोई मरीज़ नहीं मिला",
      addFirstPatient: "शुरू करने के लिए अपना पहला मरीज़ जोड़ें",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      years: "साल",
      viewDetails: "विवरण देखें",
    },
  }

  const t = texts[user?.language || "en"]

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch()
    } else {
      setFilteredPatients(patients)
    }
  }, [searchQuery, patients])

  const loadPatients = async () => {
    try {
      const data = await getPatients()
      setPatients(data)
      setFilteredPatients(data)
    } catch (error) {
      console.error("Error loading patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async () => {
    try {
      const results = await searchPatients(searchQuery)
      setFilteredPatients(results)
    } catch (error) {
      console.error("Error searching patients:", error)
    }
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 touch-target"
        />
      </div>

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className={`text-lg font-medium mb-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
              {t.noPatients}
            </h3>
            <p className={`text-muted-foreground mb-4 ${user?.language === "hi" ? "hindi-text" : ""}`}>
              {t.addFirstPatient}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium truncate ${user?.language === "hi" ? "hindi-text" : ""}`}>
                        {patient.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {getGenderText(patient.gender)}, {patient.age} {t.years}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {patient.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{patient.village}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="touch-target bg-transparent"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <span className={user?.language === "hi" ? "hindi-text" : ""}>{t.viewDetails}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          open={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  )
}
