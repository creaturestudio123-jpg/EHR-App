"use client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, CheckCircle, Clock, AlertTriangle, Eye, Download } from "lucide-react"
import { format } from "date-fns"

interface ReportsOverviewProps {
  limit?: number
}

export function ReportsOverview({ limit }: ReportsOverviewProps) {
  const { user } = useAuth()

  const texts = {
    en: {
      reports: "Reports",
      pending: "Pending Review",
      approved: "Approved",
      needsRevision: "Needs Revision",
      submittedBy: "Submitted by",
      submittedOn: "Submitted on",
      review: "Review",
      download: "Download",
      approve: "Approve",
      requestRevision: "Request Revision",
      noReports: "No reports found",
      allReportsReviewed: "All reports have been reviewed",
    },
    hi: {
      reports: "रिपोर्ट",
      pending: "समीक्षा लंबित",
      approved: "अनुमोदित",
      needsRevision: "संशोधन चाहिए",
      submittedBy: "द्वारा प्रस्तुत",
      submittedOn: "प्रस्तुत तिथि",
      review: "समीक्षा",
      download: "डाउनलोड",
      approve: "अनुमोदित करें",
      requestRevision: "संशोधन का अनुरोध",
      noReports: "कोई रिपोर्ट नहीं मिली",
      allReportsReviewed: "सभी रिपोर्ट की समीक्षा हो गई है",
    },
  }

  const t = texts[user?.language || "en"]

  // Mock reports data
  const reports = [
    {
      id: "1",
      title: "Monthly Health Report - Rampur",
      type: "monthly",
      status: "pending",
      submittedBy: "Priya Sharma",
      submittedOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      description: "Comprehensive health report covering vaccination drives and ANC checkups",
      priority: "high",
    },
    {
      id: "2",
      title: "Vaccination Drive Report - Keshavpur",
      type: "vaccination",
      status: "approved",
      submittedBy: "Sunita Devi",
      submittedOn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      description: "Report on recent vaccination drive covering 45 children",
      priority: "medium",
    },
    {
      id: "3",
      title: "ANC Follow-up Report - Govindpur",
      type: "anc",
      status: "needsRevision",
      submittedBy: "Meera Kumari",
      submittedOn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      description: "Follow-up report on pregnant women in the area",
      priority: "high",
    },
    {
      id: "4",
      title: "Weekly Activity Report - Shyampur",
      type: "weekly",
      status: "pending",
      submittedBy: "Radha Singh",
      submittedOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      description: "Weekly summary of health activities and patient visits",
      priority: "low",
    },
  ]

  const displayReports = limit ? reports.slice(0, limit) : reports

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            {t.pending}
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t.approved}
          </Badge>
        )
      case "needsRevision":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {t.needsRevision}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
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

  if (displayReports.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className={`text-lg font-medium mb-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
            {t.allReportsReviewed}
          </h3>
          <p className={`text-muted-foreground ${user?.language === "hi" ? "hindi-text" : ""}`}>{t.noReports}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!limit && (
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
              <FileText className="w-5 h-5 text-primary" />
              {t.reports}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-3">
        {displayReports.map((report) => (
          <Card key={report.id} className={`border-l-4 ${getPriorityColor(report.priority)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(report.submittedBy)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className={`font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className={user?.language === "hi" ? "hindi-text" : ""}>
                      {t.submittedBy}: {report.submittedBy}
                    </span>
                    <span className={user?.language === "hi" ? "hindi-text" : ""}>
                      {t.submittedOn}: {format(report.submittedOn, "MMM dd, yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="touch-target bg-transparent">
                      <Eye className="w-3 h-3 mr-1" />
                      <span className={user?.language === "hi" ? "hindi-text" : ""}>{t.review}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="touch-target bg-transparent">
                      <Download className="w-3 h-3 mr-1" />
                      <span className={user?.language === "hi" ? "hindi-text" : ""}>{t.download}</span>
                    </Button>
                    {report.status === "pending" && (
                      <>
                        <Button size="sm" className="touch-target">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span className={user?.language === "hi" ? "hindi-text" : ""}>{t.approve}</span>
                        </Button>
                        <Button variant="destructive" size="sm" className="touch-target">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          <span className={user?.language === "hi" ? "hindi-text" : ""}>{t.requestRevision}</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
