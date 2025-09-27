"use client"

import { useState } from "react"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  placeholder?: string
}

export function VoiceInputButton({
  onTranscript,
  className,
  size = "md",
  variant = "outline",
  placeholder,
}: VoiceInputButtonProps) {
  const { user } = useAuth()
  const [showTranscript, setShowTranscript] = useState(false)

  const { isListening, transcript, error, isSupported, startListening, stopListening, resetTranscript } = useVoiceInput(
    {
      language: user?.language === "hi" ? "hi-IN" : "en-IN",
      continuous: true,
      interimResults: true,
    },
  )

  const texts = {
    en: {
      startRecording: "Start voice recording",
      stopRecording: "Stop recording",
      listening: "Listening...",
      notSupported: "Voice input not supported",
      error: "Voice input error",
      useTranscript: "Use this text",
      tryAgain: "Try again",
      clear: "Clear",
    },
    hi: {
      startRecording: "आवाज़ रिकॉर्डिंग शुरू करें",
      stopRecording: "रिकॉर्डिंग बंद करें",
      listening: "सुन रहे हैं...",
      notSupported: "आवाज़ इनपुट समर्थित नहीं है",
      error: "आवाज़ इनपुट त्रुटि",
      useTranscript: "इस टेक्स्ट का उपयोग करें",
      tryAgain: "फिर से कोशिश करें",
      clear: "साफ़ करें",
    },
  }

  const t = texts[user?.language || "en"]

  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
      setShowTranscript(true)
    }
  }

  const handleUseTranscript = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim())
      resetTranscript()
      setShowTranscript(false)
    }
  }

  const handleClear = () => {
    resetTranscript()
    setShowTranscript(false)
  }

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={cn("text-muted-foreground", className)}
        title={t.notSupported}
      >
        <MicOff className="w-4 h-4" />
      </Button>
    )
  }

  const buttonSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleToggleListening}
        className={cn(
          buttonSizes[size],
          isListening && "bg-red-500 hover:bg-red-600 text-white animate-pulse",
          error && "bg-red-100 text-red-600",
          className,
        )}
        title={isListening ? t.stopRecording : t.startRecording}
      >
        {isListening ? <Volume2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>

      {/* Transcript popup */}
      {showTranscript && (transcript || error || isListening) && (
        <div className="absolute top-full left-0 mt-2 w-80 max-w-sm bg-white border rounded-lg shadow-lg p-4 z-50">
          {isListening && (
            <div
              className={`text-sm text-blue-600 mb-2 flex items-center gap-2 ${user?.language === "hi" ? "hindi-text" : ""}`}
            >
              <Volume2 className="w-4 h-4 animate-pulse" />
              {t.listening}
            </div>
          )}

          {error && (
            <div className={`text-sm text-red-600 mb-2 ${user?.language === "hi" ? "hindi-text" : ""}`}>
              {t.error}: {error}
            </div>
          )}

          {transcript && (
            <div className="space-y-3">
              <div
                className={`text-sm bg-gray-50 p-3 rounded border min-h-[60px] ${user?.language === "hi" ? "hindi-text" : ""}`}
              >
                {transcript || <span className="text-muted-foreground italic">{placeholder || "Speak now..."}</span>}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUseTranscript}
                  disabled={!transcript.trim()}
                  className={`flex-1 ${user?.language === "hi" ? "hindi-text" : ""}`}
                >
                  {t.useTranscript}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClear}
                  className={user?.language === "hi" ? "hindi-text" : ""}
                >
                  {t.clear}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
