"use client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Users, MapPin, Phone, Activity } from "lucide-react"

export function AshaWorkersList() {
  const { user } = useAuth()

  const texts = {
    en: {
      ashaWorkers: "ASHA Workers",
      performance: "Performance",
      patients: "Patients",
      reports: "Reports",
      area: "Area",
      phone: "Phone",
      active: "Active",
      inactive: "Inactive",
      excellent: "Excellent",
      good: "Good",
      needsAttention: "Needs Attention",
      viewDetails: "View Details",
      thisMonth: "This month",
      completionRate: "Completion Rate",
    },
    hi: {
      ashaWorkers: "आशा कार्यकर्ता",
      performance: "प्रदर्शन",
      patients: "मरीज़",
      reports: "रिपोर्ट",
      area: "क्षेत्र",
      phone: "फोन",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      excellent: "उत्कृष्ट",
      good: "अच्छा",
      needsAttention: "ध्यान चाहिए",
      viewDetails: "विवरण देखें",
      thisMonth: "इस महीने",
      completionRate: "पूर्णता दर",
    },
  }

  const t = texts[user?.language || "en"]

  // Mock ASHA workers data
  const ashaWorkers = [
    {
      id: "1",
      name: "Priya Sharma",
      phone: "9876543210",
      area: "Village Rampur",
      status: "active",
      patients: 45,
      reportsThisMonth: 28,
      completionRate: 92,
      performance: "excellent",
      lastActive: "2 hours ago",
    },
    {
      id: "2",
      name: "Sunita Devi",
      phone: "9876543211",
      area: "Village Keshavpur",
      status: "active",
      patients: 38,
      reportsThisMonth: 22,
      completionRate: 78,
      performance: "good",
      lastActive: "5 hours ago",
    },
    {
      id: "3",
      name: "Meera Kumari",
      phone: "9876543212",
      area: "Village Govindpur",
      status: "active",
      patients: 52,
      reportsThisMonth: 15,
      completionRate: 58,
      performance: "needsAttention",
      lastActive: "1 day ago",
    },
    {
      id: "4",
      name: "Radha Singh",
      phone: "9876543213",
      area: "Village Shyampur",
      status: "active",
      patients: 41,
      reportsThisMonth: 25,
      completionRate: 85,
      performance: "good",
      lastActive: "3 hours ago",
    },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{t.excellent}</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t.good}</Badge>
      case "needsAttention":
        return <Badge className="bg-red-100 text-red-800 border-red-200">{t.needsAttention}</Badge>
      default:
        return <Badge variant="secondary">{performance}</Badge>
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "needsAttention":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
            <Users className="w-5 h-5 text-primary" />
            {t.ashaWorkers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ashaWorkers.map((worker) => (
              <Card key={worker.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(worker.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className={`font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                            {worker.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{worker.area}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{worker.phone}</span>
                            </div>
                          </div>
                        </div>
                        {getPerformanceBadge(worker.performance)}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{worker.patients}</p>
                          <p className={`text-xs text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>
                            {t.patients}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{worker.reportsThisMonth}</p>
                          <p className={`text-xs text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>
                            {t.reports}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${getPerformanceColor(worker.performance)}`}>
                            {worker.completionRate}%
                          </p>
                          <p className={`text-xs text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>
                            {t.completionRate}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
                            {t.performance}
                          </span>
                          <span className="text-sm text-muted-foreground">{worker.completionRate}%</span>
                        </div>
                        <Progress
                          value={worker.completionRate}
                          className="h-2"
                          // @ts-ignore
                          indicatorClassName={
                            worker.performance === "excellent"
                              ? "bg-green-500"
                              : worker.performance === "good"
                                ? "bg-blue-500"
                                : "bg-red-500"
                          }
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="w-3 h-3" />
                          <span>Last active: {worker.lastActive}</span>
                        </div>
                        <Button variant="outline" size="sm" className="touch-target bg-transparent">
                          <span className={user?.language === "hi" ? "hindi-text" : ""}>{t.viewDetails}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
