"use client"

import { useState, useRef, useCallback } from "react"
import { useAuth } from "./use-auth"
import type { SpeechRecognition } from "web-speech-api"

interface VoiceInputOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

interface VoiceResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export function useVoiceInput(options: VoiceInputOptions = {}) {
  const { user } = useAuth()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (typeof window === "undefined") return false

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser")
      return false
    }

    const recognition = new SpeechRecognition()

    // Configure recognition
    recognition.continuous = options.continuous ?? true
    recognition.interimResults = options.interimResults ?? true
    recognition.maxAlternatives = options.maxAlternatives ?? 1

    // Set language based on user preference
    const language = options.language || (user?.language === "hi" ? "hi-IN" : "en-IN")
    recognition.lang = language

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      // Auto-stop after 3 seconds of silence
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop()
        }
      }, 3000)
    }

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    recognitionRef.current = recognition
    setIsSupported(true)
    return true
  }, [options, user?.language, isListening])

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current && !initializeRecognition()) {
      return
    }

    if (recognitionRef.current && !isListening) {
      setTranscript("")
      setError(null)
      recognitionRef.current.start()
    }
  }, [initializeRecognition, isListening])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [isListening])

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript("")
    setError(null)
  }, [])

  // Check support on mount
  useState(() => {
    initializeRecognition()
  })

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
