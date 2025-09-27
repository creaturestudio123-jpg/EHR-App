"use client"

import { useState, useEffect } from "react"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { useAuth } from "@/hooks/use-auth"
import type { Patient } from "@/lib/offline-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Phone, MapPin, User } from "lucide-react"

export function AllPatientsList() {
  const { getPatients, searchPatients } = useOfflineStorage()
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [villageFilter, setVillageFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const texts = {
    en: {
      allPatients: "All Patients",
      searchPlaceholder: "Search patients...",
      filterByVillage: "Filter by Village",
      filterByGender: "Filter by Gender",
      allVillages: "All Villages",
      allGenders: "All Genders",
      male: "Male",
      female: "Female",
      other: "Other",
      years: "years",
      ashaWorker: "ASHA Worker",
      noPatients: "No patients found",
      totalPatients: "Total Patients",
      viewDetails: "View Details",
    },
    hi: {
      allPatients: "सभी मरीज़",
      searchPlaceholder: "मरीज़ खोजें...",
      filterByVillage: "गांव के अनुसार फिल्टर करें",
      filterByGender: "लिंग के अनुसार फिल्टर करें",
      allVillages: "सभी गांव",
      allGenders: "सभी लिंग",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      years: "साल",
      ashaWorker: "आशा कार्यकर्ता",
      noPatients: "कोई मरीज़ नहीं मिला",
      totalPatients: "कुल मरीज़",
      viewDetails: "विवरण देखें",
    },
  }

  const t = texts[user?.language || "en"]

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, villageFilter, genderFilter, patients])

  const loadPatients = async () => {
    try {
      const data = await getPatients() // PHC staff can see all patients
      setPatients(data)
    } catch (error) {
      console.error("Error loading patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    let filtered = patients

    // Apply search
    if (searchQuery.trim()) {
      try {
        filtered = await searchPatients(searchQuery)
      } catch (error) {
        console.error("Error searching patients:", error)
      }
    }

    // Apply village filter
    if (villageFilter !== "all") {
      filtered = filtered.filter((patient) => patient.village === villageFilter)
    }

    // Apply gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((patient) => patient.gender === genderFilter)
    }

    setFilteredPatients(filtered)
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

  const getUniqueVillages = () => {
    const villages = [...new Set(patients.map((p) => p.village))]
    return villages.sort()
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
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center justify-between ${user?.language === "hi" ? "hindi-text" : ""}`}>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t.allPatients}
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredPatients.length} {t.totalPatients}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
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

            {/* Filters */}
            <div className="grid grid-cols-2 gap-4">
              <Select value={villageFilter} onValueChange={setVillageFilter}>
                <SelectTrigger className="h-12 touch-target">
                  <SelectValue placeholder={t.filterByVillage} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allVillages}</SelectItem>
                  {getUniqueVillages().map((village) => (
                    <SelectItem key={village} value={village}>
                      {village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="h-12 touch-target">
                  <SelectValue placeholder={t.filterByGender} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allGenders}</SelectItem>
                  <SelectItem value="male">{t.male}</SelectItem>
                  <SelectItem value="female">{t.female}</SelectItem>
                  <SelectItem value="other">{t.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Patient List */}
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`text-lg font-medium mb-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
                {t.noPatients}
              </h3>
            </div>
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

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
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

                        <div className="text-xs text-muted-foreground">
                          <span className={user?.language === "hi" ? "hindi-text" : ""}>{t.ashaWorker}:</span>{" "}
                          {patient.ashaWorkerId === "1" ? "Priya Sharma" : "Unknown"}
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="touch-target bg-transparent">
                        <span className={user?.language === "hi" ? "hindi-text" : ""}>{t.viewDetails}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
