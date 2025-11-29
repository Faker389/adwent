"use client"
import { motion } from "framer-motion"
import type React from "react"

import { Gift, Star, Sparkles, TreePine, Clock, Lock, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "../lib/utils"
import { useEffect, useState } from "react"
import { getQuestionStatus, getTimeRemaining, type QuestionStatus } from "../lib/questions"
import type { Question } from "../lib/userModel"
import { Timestamp } from "firebase/firestore"
import { useUser } from "../lib/useQuestions"

interface CalendarWindowProps {
  day: number
  questions: Question[]
  onClick: () => void
  style?: React.CSSProperties
  isAnswered?: boolean
}

const icons = [Gift, Star, Sparkles, TreePine]

export const CalendarWindow = ({ day, questions, onClick, style, isAnswered = false }: CalendarWindowProps) => {
  const Icon = icons[day % icons.length]
  const isSpecialDay = day % 5 === 0 || day === 24
  const [timeLeft, setTimeLeft] = useState("")
  const [status, setStatus] = useState<QuestionStatus>("locked")
  const [currentTime, setCurrentTime] = useState("")
  const { user } = useUser()

  const question = questions[day - 1]

  const questionAnswered = user?.questions?.[day - 1]?.answer != null

  useEffect(() => {
    const updateStatus = () => {
      if (questions.length > 0) {
        setStatus(getQuestionStatus(day, questions))
        setTimeLeft(getTimeRemaining(day, questions))
      }

      // Format current countdown as real-time clock
      if (question) {
        const now = new Date()

        // Convert Firebase Timestamp to JavaScript Date
        const targetDate =
          question.openDate instanceof Timestamp ? question.openDate.toDate() : new Date(question.openDate)

        const diff = targetDate.getTime() - now.getTime()

        if (diff > 0) {
          // Show countdown to open date
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((diff % (1000 * 60)) / 1000)

          if (days > 0) {
            setCurrentTime(`${days}d ${hours}h ${minutes}m`)
          } else if (hours > 0) {
            setCurrentTime(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
          } else {
            setCurrentTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
          }
        } else {
          // Question is open - show time until deadline
          const deadline = new Date(targetDate)
          deadline.setDate(deadline.getDate() )
          deadline.setHours(23, 59, 59)
          const deadlineDiff = deadline.getTime() - now.getTime()

          if (deadlineDiff > 0) {
            const dDays = Math.floor(deadlineDiff / (1000 * 60 * 60 * 24))
            const dHours = Math.floor((deadlineDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const dMinutes = Math.floor((deadlineDiff % (1000 * 60 * 60)) / (1000 * 60))
            const dSeconds = Math.floor((deadlineDiff % (1000 * 60)) / 1000)

            if (dDays > 0) {
              setCurrentTime(`${dDays}d ${dHours}h`)
            } else if (dHours > 0) {
              setCurrentTime(
                `${dHours}:${dMinutes.toString().padStart(2, "0")}:${dSeconds.toString().padStart(2, "0")}`,
              )
            } else {
              setCurrentTime(`${dMinutes}:${dSeconds.toString().padStart(2, "0")}`)
            }
          } else {
            setCurrentTime("Zakończone")
          }
        }
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000)
    return () => clearInterval(interval)
  }, [day, questions, question])

  const handleClick = () => {
    if (status !== "locked") {
      onClick()
    }
  }

  const isClickable = status === "available" || status === "expiring" || status === "expired"
  const isLocked = status === "locked"
  const isExpired = status === "expired"

  // If no questions loaded yet, show loading state
  if (questions.length === 0) {
    return (
      <motion.div
        style={style}
        className="rounded-xl sm:rounded-2xl p-2 sm:p-4 backdrop-blur-sm border-2 border-gray-600 bg-gray-800/50 w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center"
      >
        <span className="font-christmas text-lg sm:text-3xl text-gray-400">{day}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: day * 0.03 }}
      whileHover={isClickable ? { scale: 1.15, rotate: 0, zIndex: 50 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      onClick={handleClick}
      className={cn(
        "rounded-xl sm:rounded-2xl p-2 sm:p-4 backdrop-blur-sm border-2 transition-all duration-300",
        "flex flex-col items-center justify-center gap-0.5 sm:gap-1 relative overflow-hidden group",
        "w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28",
        isClickable && "cursor-pointer",
        isLocked && "cursor-not-allowed opacity-70",
        questionAnswered &&
          "ring-2 ring-green-400 ring-offset-2 ring-offset-transparent bg-gradient-to-br from-green-600/40 to-green-700/40 border-green-400 shadow-lg shadow-green-500/30",
        !questionAnswered &&
          (isSpecialDay
            ? "bg-gradient-to-br from-yellow-500/40 to-amber-600/40 border-yellow-400 shadow-lg shadow-yellow-500/30"
            : status === "expiring"
              ? "bg-gradient-to-br from-orange-500/40 to-red-600/40 border-orange-400 shadow-lg shadow-orange-500/30"
              : "bg-gradient-to-br from-red-800/50 to-red-900/50 border-red-400/60 shadow-md shadow-red-500/20"),
      )}
    >
      {/* Glow effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          questionAnswered
            ? "bg-gradient-to-br from-green-400/30 to-green-500/30"
            : isClickable &&
                (isSpecialDay
                  ? "bg-gradient-to-br from-yellow-400/30 to-amber-500/30"
                  : "bg-gradient-to-br from-red-400/20 to-red-600/20"),
        )}
      />

      {/* Status Icon */}
      {isLocked && <Lock className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400 relative z-10" />}
      {questionAnswered && isClickable && (
        <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-green-300 relative z-10" />
      )}
      {!questionAnswered && !isLocked && (
        <Icon
          className={cn(
            "w-3 h-3 sm:w-5 sm:h-5 relative z-10",
            isExpired
              ? "text-gray-400"
              : isSpecialDay
                ? "text-yellow-300"
                : status === "expiring"
                  ? "text-orange-300"
                  : "text-red-300",
          )}
        />
      )}

      {/* Day number */}
      <span
        className={cn(
          "font-christmas text-lg sm:text-3xl md:text-4xl font-bold relative z-10",
          isLocked
            ? "text-gray-400"
            : questionAnswered
              ? "text-green-300"
              : isExpired
                ? "text-gray-400"
                : isSpecialDay
                  ? "text-yellow-300"
                  : status === "expiring"
                    ? "text-orange-300"
                    : "text-white",
        )}
      >
        {day}
      </span>

      {/* Real-time countdown clock */}
      <div
        className={cn(
          "flex items-center gap-0.5 text-[12px] sm:text-[10px] font-mono relative z-10 tabular-nums",
          isLocked
            ? "text-gray-400"
            : questionAnswered
              ? "text-green-300"
              : isExpired
                ? "text-gray-500"
                : status === "expiring"
                  ? "text-orange-300"
                  : "text-green-500 text-xl ",
        )}
      >
        {questionAnswered && <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3" />}
        {!questionAnswered && status === "expiring" && <AlertTriangle className="w-2 h-2 sm:w-3 sm:h-3" />}
        {!questionAnswered && isLocked && <Clock className="w-2 h-2 sm:w-3 sm:h-3" />}
        {!questionAnswered && isClickable && !isExpired && <Clock className="w-2 h-2 sm:w-3 sm:h-3" />}
        <span className="truncate max-w-[50px] text-[12px] md:text-[12px] lg:text-lg sm:max-w-[70px]">
          {questionAnswered ? "✓" : isExpired ? "✕" : currentTime}
        </span>
      </div>

      {/* Decorative corner elements - only on larger screens */}
      {isClickable && (
        <>
          <div className="hidden sm:block absolute top-1 right-1 text-amber-400/60 text-[8px] animate-pulse">✨</div>
          <div
            className="hidden sm:block absolute bottom-1 left-1 text-yellow-400/60 text-[8px] animate-pulse"
            style={{ animationDelay: "1s" }}
          >
            ⭐
          </div>
        </>
      )}
    </motion.div>
  )
}
