"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface User {
  id: string
  name: string
  role: "asha_worker" | "phc_staff"
  phone: string
  area?: string
  language: "en" | "hi"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, pin: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const checkExistingSession = () => {
      try {
        const storedUser = localStorage.getItem("ehr_user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error loading user session:", error)
        localStorage.removeItem("ehr_user")
      } finally {
        setLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  const login = async (phone: string, pin: string): Promise<boolean> => {
    setLoading(true)

    try {
      // Simulate authentication - in real app, this would validate against offline storage
      // For demo purposes, using predefined users
      const demoUsers: User[] = [
        {
          id: "1",
          name: "Priya Sharma",
          role: "asha_worker",
          phone: "9876543210",
          area: "Village Rampur",
          language: "hi",
        },
        {
          id: "2",
          name: "Dr. Rajesh Kumar",
          role: "phc_staff",
          phone: "9876543211",
          language: "en",
        },
      ]

      // Simple authentication logic
      const foundUser = demoUsers.find((u) => u.phone === phone && pin === "1234")

      if (foundUser) {
        setUser(foundUser)
        localStorage.setItem("ehr_user", JSON.stringify(foundUser))
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ehr_user")
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
