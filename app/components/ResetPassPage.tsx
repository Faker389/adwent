"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { confirmPasswordReset } from "firebase/auth"
import { auth } from "../lib/firebase"
import { useRouter } from "next/navigation"

interface ResetPasswordFormProps {
  oobCode: string
  showAlert: (e: string, e2: "error" | "success" | "warning") => void
}

export const ResetPasswordForm = ({ oobCode, showAlert }: ResetPasswordFormProps) => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      showAlert("Hasła nie są takie same!", "error")
      return
    }

    if (password.length < 6) {
      showAlert("Hasło musi mieć co najmniej 6 znaków!", "error")
      return
    }

    setLoading(true)

    try {
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess(true)
      showAlert("Hasło zostało zmienione pomyślnie!", "success")

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error: any) {
      showAlert(error.message || "Błąd podczas zmiany hasła", "error")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-b from-red-900/90 to-red-950/90 backdrop-blur-lg border-2 border-yellow-400/50 rounded-3xl p-8 shadow-2xl text-center"
      >
        <CheckCircle className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
        <h2
          className="font-christmas text-4xl font-bold text-yellow-400 mb-2"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
        >
          Sukces!
        </h2>
        <p className="text-red-200 font-serif text-lg">
          Twoje hasło zostało zmienione. Przekierowujemy Cię do logowania...
        </p>
      </motion.div>
    )
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
          <Lock className="w-16 h-16 text-yellow-400 animate-pulse" />
        </div>
        <h2
          className="font-christmas text-4xl font-bold text-yellow-400 mb-2"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
        >
          Nowe Hasło
        </h2>
        <p className="text-red-200 font-serif">Wpisz swoje nowe hasło</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-yellow-400">Nowe Hasło</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value.trim().slice(0, 30))}
              placeholder="••••••••"
              required
              className="bg-red-800/50 border-red-700 focus:border-yellow-400 text-white placeholder:text-red-300/50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300 hover:text-yellow-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-yellow-400">Potwierdź Hasło</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value.trim().slice(0, 30))}
              placeholder="••••••••"
              required
              className="bg-red-800/50 border-red-700 focus:border-yellow-400 text-white placeholder:text-red-300/50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300 hover:text-yellow-400 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-6 rounded-2xl shadow-lg transition-all duration-300"
        >
          {loading ? "Zmieniam hasło..." : "Zmień Hasło"}
        </Button>
      </form>
    </motion.div>
  )
}