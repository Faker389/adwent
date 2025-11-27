"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../lib/firebase"

interface ForgotPasswordFormProps {
  onBack: () => void
  showAlert: (e: string, e2: "error" | "success" | "warning") => void
}

export const ForgotPasswordForm = ({ onBack, showAlert }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/reset-password`,
        handleCodeInApp: true,
      })
      showAlert("Email Wysłany!", "success")
      setEmail("")
    } catch (error: any) {
      showAlert(error.message || "Błąd podczas wysyłania emaila", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-b from-red-900/90 to-red-950/90 backdrop-blur-lg border-2 border-yellow-400/50 rounded-3xl p-8 shadow-2xl"
    >
      <div className="text-center mb-8">
        <div className="inline-block mb-4">
          <Mail className="w-16 h-16 text-yellow-400 animate-pulse" />
        </div>
        <h2
          className="font-christmas text-4xl font-bold text-yellow-400 mb-2"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
        >
          Zapomniałeś hasła?
        </h2>
        <p className="text-red-200 font-serif">Wpisz swój email, a wyślemy Ci link do resetowania hasła</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-yellow-400">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.com"
            required
            className="bg-red-800/50 border-red-700 focus:border-yellow-400 text-white placeholder:text-red-300/50"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-6 rounded-2xl shadow-lg transition-all duration-300"
        >
          {loading ? "Wysyłanie..." : "Wyślij link resetujący"}
        </Button>

        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="w-full text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do logowania
        </Button>
      </form>
    </motion.div>
  )
}
