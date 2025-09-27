"use client"

import { useState, useRef } from "react"
import { VoiceInputButton } from "./voice-input-button"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface VoiceEnabledInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  type?: string
  required?: boolean
  disabled?: boolean
  label?: string
}

export function VoiceEnabledInput({
  value,
  onChange,
  placeholder,
  className,
  type = "text",
  required,
  disabled,
  label,
}: VoiceEnabledInputProps) {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleVoiceTranscript = (transcript: string) => {
    // Replace existing text with voice input for single-line inputs
    onChange(transcript)

    // Focus input after voice input
    if (inputRef.current) {
      inputRef.current.focus()
      // Set cursor to end
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(transcript.length, transcript.length)
        }
      }, 0)
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className={`text-sm font-medium ${user?.language === "hi" ? "hindi-text" : ""}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent",
            user?.language === "hi" && "hindi-text",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          required={required}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            size="sm"
            variant="ghost"
            placeholder={placeholder}
            className={cn("transition-opacity", !isFocused && !value && "opacity-60")}
          />
        </div>
      </div>
    </div>
  )
}
