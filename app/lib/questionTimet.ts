// Utility functions for managing question timers with localStorage

export interface QuestionTimer {
    questionNumber: number
    startTime: number // timestamp when modal was first opened
    expiresAt: number // timestamp when 1 hour expires
  }
  
  const STORAGE_KEY = "advent_question_timers"
  const ONE_HOUR = 60 * 60 * 1000 // 1 hour in milliseconds
  
  // Get all timers from localStorage
  export const getQuestionTimers = (): QuestionTimer[] => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading question timers:", error)
      return []
    }
  }
  
  // Save timers to localStorage
  const saveQuestionTimers = (timers: QuestionTimer[]): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers))
    } catch (error) {
      console.error("Error saving question timers:", error)
    }
  }
  
  // Start timer for a question (only if not already started)
  export const startQuestionTimer = (questionNumber: number): QuestionTimer => {
    const timers = getQuestionTimers()
  
    // Check if timer already exists
    const existing = timers.find((t) => t.questionNumber === questionNumber)
    if (existing) {
      return existing
    }
  
    // Create new timer
    const now = Date.now()
    const newTimer: QuestionTimer = {
      questionNumber,
      startTime: now,
      expiresAt: now + ONE_HOUR,
    }
  
    timers.push(newTimer)
    saveQuestionTimers(timers)
  
    return newTimer
  }
  
  // Get timer for a specific question
  export const getQuestionTimer = (questionNumber: number): QuestionTimer | null => {
    const timers = getQuestionTimers()
    return timers.find((t) => t.questionNumber === questionNumber) || null
  }
  
  // Check if question timer has expired
  export const isQuestionTimerExpired = (questionNumber: number): boolean => {
    const timer = getQuestionTimer(questionNumber)
    if (!timer) return false
  
    return Date.now() > timer.expiresAt
  }
  
  // Get remaining time for a question in milliseconds
  export const getQuestionTimeRemaining = (questionNumber: number): number => {
    const timer = getQuestionTimer(questionNumber)
    if (!timer) return ONE_HOUR // Full hour if not started
  
    const remaining = timer.expiresAt - Date.now()
    return Math.max(0, remaining)
  }
  
  // Format remaining time as string (HH:MM:SS)
  export const formatTimeRemaining = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
  
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
  
  // Clear timer for a question (optional cleanup)
  export const clearQuestionTimer = (questionNumber: number): void => {
    const timers = getQuestionTimers()
    const filtered = timers.filter((t) => t.questionNumber !== questionNumber)
    saveQuestionTimers(filtered)
  }
  