"use client"
import { motion, AnimatePresence } from "framer-motion"
import type React from "react"
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore"

import { X, Sparkles, Lock, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useState, useEffect } from "react"
import { toast } from "../hooks/use-toast"
import { getQuestionStatus, getTimeRemaining, canAnswerQuestion, type QuestionStatus } from "../lib/questions"
import type { Question, ABCOption, TrueFalseOption, AppUser } from "../lib/userModel"
import { db } from "../lib/firebase"
import { useUser } from "../lib/useQuestions"
import {
  startQuestionTimer,
  isQuestionTimerExpired,
  getQuestionTimeRemaining,
  formatTimeRemaining,
} from "../lib/questionTimet"

interface QuestionModalProps {
  day: number
  questions: Question[]
  isOpen: boolean | null
  onClose: () => void
  isAnswered: boolean
  onAnswerSubmitted?: () => void
}

// Helper function to convert Firebase Timestamp to Date
const toDate = (timestamp: Timestamp | Date | unknown): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  return timestamp instanceof Date ? timestamp : new Date(timestamp as string)
}

export const QuestionModal = ({
  day,
  questions,
  isOpen,
  onClose,
  isAnswered,
  onAnswerSubmitted,
}: QuestionModalProps) => {
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")
  const [status, setStatus] = useState<QuestionStatus>("locked")
  const [clickedImage, setClickedImage] = useState<string>("")
  const [countdown, setCountdown] = useState("")
  const [hourTimer, setHourTimer] = useState("")
  const [hourTimerExpired, setHourTimerExpired] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, isLoadedUser, listenToUser } = useUser()

  useEffect(() => {
    listenToUser()
  }, [listenToUser])

  // Track mobile status
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const question = questions[day - 1]

  useEffect(() => {
    if (isOpen && question && !isAnswered) {
      const currentStatus = getQuestionStatus(day, questions)
      if (currentStatus === "available" || currentStatus === "expiring") {
        startQuestionTimer(day)
      }
    }
  }, [isOpen, day, question, isAnswered, questions])

  useEffect(() => {
    if (isOpen && questions.length > 0) {
      const updateStatus = () => {
        setStatus(getQuestionStatus(day, questions))
        setTimeLeft(getTimeRemaining(day, questions))

        if (!isAnswered) {
          const remaining = getQuestionTimeRemaining(day)
          setHourTimer(formatTimeRemaining(remaining))
          setHourTimerExpired(isQuestionTimerExpired(day))
        }

        // Real-time countdown
        if (question) {
          const now = new Date()
          const currentStatus = getQuestionStatus(day, questions)
          const openDate = toDate(question.openDate)

          if (currentStatus === "locked") {
            const diff = openDate.getTime() - now.getTime()
            if (diff > 0) {
              const days = Math.floor(diff / (1000 * 60 * 60 * 24))
              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

              if (days > 0) {
                setCountdown(isMobile ? `${days}d ${hours}h ${minutes}m` : `${days}d ${hours}h ${minutes}m`)
              } else {
                setCountdown(
                  isMobile 
                    ? `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                    : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
                )
              }
            }
          } else if (currentStatus === "available" || currentStatus === "expiring") {
            const deadline = new Date(openDate)
            deadline.setDate(deadline.getDate() )
            deadline.setHours(23, 59, 59, 999)
            const diff = deadline.getTime() - now.getTime()

            if (diff > 0) {
              const days = Math.floor(diff / (1000 * 60 * 60 * 24))
              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

              if (days > 0) {
                setCountdown(isMobile ? `${days}d ${hours}h ${minutes}m` : `${days}d ${hours}h ${minutes}m`)
              } else {
                setCountdown(
                  isMobile 
                    ? `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                    : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
                )
              }
            }
          }
        }
      }
      updateStatus()
      const interval = setInterval(updateStatus, 1000)
      return () => clearInterval(interval)
    }
  }, [isOpen, day, questions, question, isAnswered])

  // Check if answer is correct based on question type
  const checkAnswer = (): boolean | null => {
    if (!question) return null

    const correctAnswer = question.answer!
    const userAnswer = answer.trim().toLowerCase()

    // Type 1: ABC Options (a, b, c)
    if (question.questionType === 1) {
      // Compare lowercase letters (a, b, or c)
      return userAnswer.toLowerCase() === correctAnswer.toLowerCase()
    }

    // Type 3: True/False (t/f stored, but Richtig/Falsch displayed)
    if (question.questionType === 3) {
      // Convert user's Richtig/Falsch to t/f for comparison
      const userAnswerConverted = userAnswer === "richtig" ? "t" : "f"
      return userAnswerConverted === correctAnswer.toLowerCase()
    }

    // Type 2: Text Input - return null (to be checked manually later)
    if (question.questionType === 2) {
      return null
    }

    return null
  }

  async function updateUserQuestion(questionNumber: number, answer: string, isCorrect: boolean) {
    try {
      const userRef = doc(db, "users", user?.id!)

      // Get current user data
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        throw new Error("User document not found")
      }

      const userData = userSnap.data() as AppUser

      // Find and update the specific question
      const updatedQuestions = userData.questions.map((q) => {
        if (q.questionNumber === questionNumber) {
          return {
            ...q,
            answer:answer.toLowerCase(),
            isCorrect,
          }
        }
        return q
      })

      // Update the entire questions array
      
      await updateDoc(userRef, {
        questions: updatedQuestions,
      })

      console.log(`Question ${questionNumber} updated successfully`)
      return { success: true }
    } catch (error) {
      console.error("Error updating question:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return

    if (isAnswered) {
      toast({
        title: "Już odpowiedziano! ✅",
        description: "Odpowiedziałeś już na to pytanie.",
        variant: "destructive",
      })
      return
    }

    if (hourTimerExpired) {
      toast({
        title: "Czas minął! ⏰",
        description: "Minęła godzina od otwarcia pytania. Nie możesz już odpowiedzieć.",
        variant: "destructive",
      })
      return
    }

    if (!canAnswerQuestion(day, questions)) {
      toast({
        title: "Czas minął! ⏰",
        description: "Nie możesz już odpowiedzieć na to pytanie.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Check if answer is correct based on question type
      const isCorrect = checkAnswer()

      // Update in Firebase
      await updateUserQuestion(day, answer.trim(), isCorrect!)

      // Different messages based on question type
      if (isCorrect === null) {
        // Text input - needs manual verification
        toast({
          title: "Odpowiedź zapisana! 🎁",
          description: "Twoja odpowiedź zostanie sprawdzona przez nauczyciela.",
        })
      } else if (isCorrect === true) {
        // Correct answer
        toast({
          title: "Odpowiedź prawidłowa! 🎉",
          description: "Brawo! Zdobyłeś punkty!",
        })
      } else {
        // Incorrect answer
        toast({
          title: "Odpowiedź nieprawidłowa 😔",
          description: "Niestety, to nie jest poprawna odpowiedź.",
          variant: "destructive",
        })
      }

      setAnswer("")
      onAnswerSubmitted?.()
      onClose()
    } catch (error) {
      console.error("Error submitting answer:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać odpowiedzi. Spróbuj ponownie.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isLocked = status === "locked"
  const isExpired = status === "expired"
  const canAnswer = (status === "available" || status === "expiring") && !isAnswered && !hourTimerExpired

  // Format the open date for display
  const formatOpenDate = () => {
    if (!question) return ""
    const date = toDate(question.openDate)
    return `${date.getDate()} grudnia ${date.getFullYear()}`
  }

  const isABCOption = (options: ABCOption | TrueFalseOption | undefined): options is ABCOption => {
    return options !== undefined && "a" in options
  }

  const isTrueFalseOption = (options: ABCOption | TrueFalseOption | undefined): options is TrueFalseOption => {
    return options !== undefined && "t" in options
  }
  useEffect(() => {
    if (clickedImage) {
      // Disable scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [clickedImage]);
  
  const renderAnswerInput = () => {
    if (!question || !canAnswer) return null

    // Type 1: ABC Options
    if (question.questionType === 1 && isABCOption(question.options)) {
      const options = question.options
      return (
        <div className="space-y-3 ">
          <Label className="text-white font-serif text-sm sm:text-base">Wybierz odpowiedź:</Label>
          <div className="space-y-2">
            {["a", "b", "c"].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAnswer(key.toUpperCase())}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                  answer === key.toUpperCase()
                    ? "bg-yellow-400 border-yellow-400 text-black font-bold"
                    : "bg-red-800/50 border-red-700 text-white hover:border-yellow-400/50 hover:bg-red-800/70"
                }`}
              >
                <span className="font-bold mr-3">{key.toUpperCase()})</span>
                {options[key as keyof ABCOption]}
              </button>
            ))}
          </div>
        </div>
      )
    }

    // Type 3: True/False (Richtig/Falsch)
    if (question.questionType === 3 && isTrueFalseOption(question.options)) {
      const options = question.options
      return (
        <div className="space-y-3">
          <Label className="text-white font-serif text-sm sm:text-base">Wybierz odpowiedź:</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAnswer("Richtig")}
              className={`p-4 rounded-xl transition-all duration-200 border-2 font-bold ${
                answer === "Richtig"
                  ? "bg-yellow-400 border-yellow-400 text-black"
                  : "bg-red-800/50 border-red-700 text-white hover:border-yellow-400/50 hover:bg-red-800/70"
              }`}
            >
              {options.t}
            </button>
            <button
              type="button"
              onClick={() => setAnswer("Falsch")}
              className={`p-4 rounded-xl transition-all duration-200 border-2 font-bold ${
                answer === "Falsch"
                  ? "bg-yellow-400 border-yellow-400 text-black"
                  : "bg-red-800/50 border-red-700 text-white hover:border-yellow-400/50 hover:bg-red-800/70"
              }`}
            >
              {options.f}
            </button>
          </div>
        </div>
      )
    }

    // Type 2: Text Input (default)
    return (
      <div className="space-y-2">
        <Label htmlFor="answer" className="text-white font-serif text-sm sm:text-base">
          Twoja odpowiedź: *<span className="text-xs sm:text-sm">(Odpowiedzi udziel w języku niemieckim)</span>
        </Label>
        <Input
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Wpisz swoją odpowiedź..."
          className="bg-red-800/50 border-red-700 text-white placeholder:text-red-300/50 h-12 rounded-xl focus:border-yellow-400"
          required
        />
      </div>
    )
  }

  return (
    <AnimatePresence >
      <>
     {clickedImage && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[999] bg-black/80 flex justify-center items-center"
  >
    {/* Close button */}
    <button
      onClick={() => setClickedImage("")}
      className="absolute top-6 right-6 text-white hover:text-gray-300"
    >
      <X className="w-10 h-10" />
    </button>

    {/* Image */}
    <motion.img
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      src={clickedImage}
      className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
    />
  </motion.div>
)}
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-red-950/80 backdrop-blur-sm z-50 "
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto overscroll-contain">
          <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative overflow-x-hidden w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-red-900 to-red-950 border-2 border-yellow-400/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl styled-scrollbar"
              >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-red-300 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400 animate-pulse" />
                <h2
                  className="font-christmas text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400"
                  style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
                >
                  Dzień {day}
                </h2>
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400 animate-pulse" style={{ animationDelay: "1s" }} />
              </div>

              {!isAnswered && !isLocked && !isExpired && (
                <div
                  className={`text-center mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl border-2 ${
                    hourTimerExpired ? "bg-red-900/50 border-red-500" : "bg-green-900/30 border-green-500"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      {hourTimerExpired ? "Czas na odpowiedź minął!" : "Czas na odpowiedź:"}
                    </span>
                  </div>
                  <div
                    className={`font-mono font-bold tabular-nums text-base sm:text-lg md:text-xl ${
                      hourTimerExpired ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {hourTimerExpired ? "00:00" : hourTimer}
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    {hourTimerExpired ? "Nie możesz już odpowiedzieć" : "od otwarcia pytania"}
                  </p>
                </div>
              )}

              {/* Real-time countdown */}
              <div
                className={`text-center mb-3 sm:mb-4 ${
                  status === "expiring"
                    ? "text-orange-400"
                    : isExpired
                      ? "text-red-400"
                      : isLocked
                        ? "text-gray-400"
                        : "text-green-400"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 text-xs sm:text-sm md:text-base lg:text-lg">
                  {status === "expiring" && <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
                  {isLocked && <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
                  {!isLocked && !isExpired && <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
                  <span className="break-words">
                    {isLocked && "Otwiera się za:"}
                    {isExpired && "Czas na odpowiedź minął"}
                    {!isLocked && !isExpired && (status === "expiring" ? "⚠️ Ostatnia szansa!" : "Dostępne przez:")}
                  </span>
                </div>
                {!isExpired && <div className="font-mono text-sm sm:text-base md:text-lg lg:text-xl font-bold tabular-nums break-all">{countdown}</div>}
              </div>

              {/* Decorative divider */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
                <span className="text-yellow-400 text-base sm:text-xl">❄️</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
              </div>

              {/* Question */}
              <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-red-800/50 rounded-2xl border border-red-700">
                {isAnswered ? (
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg text-green-400 font-serif font-bold mb-2">
                      ✅ Odpowiedziałeś już na to pytanie
                    </p>
                    <p className="text-xs sm:text-sm text-gray-300">Twoja odpowiedź została zapisana i będzie oceniona</p>
                  </div>
                ) : isLocked ? (
                  <div className="text-center">
                    <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg text-gray-400 font-serif">To pytanie zostanie odblokowane</p>
                    <p className="text-lg sm:text-xl text-yellow-400 font-bold mt-2">{formatOpenDate()}</p>
                  </div>
                ) : hourTimerExpired ? (
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg text-red-400 font-serif font-bold">⏰ Czas minął!</p>
                    <p className="text-xs sm:text-sm text-gray-300 mt-2">Minęła godzina od otwarcia tego pytania</p>
                  </div>
                ) : questions.length === 0 ? (
                  <p className="text-base sm:text-lg text-center text-gray-400 font-serif">Ładowanie pytania...</p>
                ) : (
                  <>
                    {question?.image && (
                      <div className="mb-3 sm:mb-4 flex justify-center">
                        <img
                          src={question.image || "/placeholder.svg"}
                          alt={`Obrazek do pytania ${day}`}
                          onClick={()=>setClickedImage(question.image!)}
                          className="max-w-full max-h-32 sm:max-h-48 rounded-xl border-2 border-red-700"
                        />
                      </div>
                    )}
                    <div>

                      {question?.question.includes("&")?question.question.split("&").map((e,idx)=>{
                        return <p key={idx} className="text-sm sm:text-base md:text-lg text-center text-white font-serif leading-relaxed">{e.replace(/&/g, '\n')}</p>
                      }) :question?.question?<p className="text-sm sm:text-base md:text-lg text-center text-white font-serif leading-relaxed">{question.question}</p>:<p className="text-sm sm:text-base md:text-lg text-center text-white font-serif leading-relaxed">Brak pytania na ten dzień</p>}
                    
                      </div>
                  </>
                )}
              </div>

              {/* Form */}
              {canAnswer ? (
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  {renderAnswerInput()}

                  <Button
                    type="submit"
                    disabled={loading || !answer.trim()}
                    className="w-full h-10 sm:h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold text-sm sm:text-base md:text-lg rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Wysyłanie..." : "Wyślij odpowiedź 🎁"}
                  </Button>
                </form>
              ) : isExpired || hourTimerExpired || isAnswered ? (
                <div className="text-center py-3 sm:py-4">
                  <p className="text-sm sm:text-base text-red-400 font-serif mb-3 sm:mb-4">
                    {isAnswered
                      ? "Już odpowiedziałeś na to pytanie."
                      : hourTimerExpired
                        ? "Minęła godzina od otwarcia pytania."
                        : "Czas na odpowiedź na to pytanie już minął."}
                  </p>
                  <Button onClick={onClose} className="bg-red-800 hover:bg-red-700 text-white text-sm sm:text-base">
                    Zamknij
                  </Button>
                </div>
              ) : (
                <div className="text-center py-3 sm:py-4">
                  <Button onClick={onClose} className="bg-red-800 hover:bg-red-700 text-white text-sm sm:text-base">
                    Zamknij
                  </Button>
                </div>
              )}

              {/* Decorative elements */}
              <div className="absolute -top-3 -left-3 text-yellow-400 text-2xl animate-pulse">✨</div>
              <div
                className="absolute -bottom-3 -right-3 text-yellow-400 text-2xl animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                ⭐
              </div>
            </motion.div>
          </div>
        </>
      )}</>
    </AnimatePresence>
  )
}
