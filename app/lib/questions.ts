import { 
  addDoc, 
  collection, 
  Timestamp, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "./firebase";
import { Question } from "./userModel";


// Fetch a specific question by day
export const fetchQuestionByDay = async (day: number, allQuestions: Question[]): Promise<Question | null> => {
  if (day < 1 || day > allQuestions.length) return null;
  return allQuestions[day - 1];
};

// Check if a question is available (opened)
export const isQuestionAvailable = (day: number, questions: Question[]): boolean => {
  const now = new Date();
  const question = questions[day - 1];
  if (!question) return false;
  return now >= question.openDate.toDate();
};

// Check if a question can still be answered (within 2 days of opening)
export const canAnswerQuestion = (day: number, questions: Question[]): boolean => {
  const now = new Date();
  const question = questions[day - 1];
  if (!question) return false;
  
  // Question must be open first
  if (now < question.openDate.toDate()) return false;
  
  // Calculate the deadline (2 days after opening at 23:59:59)
  const deadline = new Date(question.openDate.toDate());
  deadline.setDate(deadline.getDate() + 2);
  deadline.setHours(23, 59, 59, 999);
  
  return now <= deadline;
};

// Get question status
export type QuestionStatus = 'locked' | 'available' | 'expiring' | 'expired';

export const getQuestionStatus = (day: number, questions: Question[]): QuestionStatus => {
  const now = new Date();
  const question = questions[day - 1];
  if (!question) return 'locked';
  
  // Not yet opened
  if (now < question.openDate.toDate()) return 'locked';
  
  // Calculate deadline
  const deadline = new Date(question.openDate.toDate());
  deadline.setDate(deadline.getDate() +1);
  deadline.setHours(23, 59, 59, 999);
  
  // Already expired
  if (now > deadline) return 'expired';
  
  // Expiring soon (last day)
  const oneDay = 24 * 60 * 60 * 1000;
  if (deadline.getTime() - now.getTime() < oneDay) return 'expiring';
  
  return 'available';
};

// Get time remaining until question opens or expires
export const getTimeRemaining = (day: number, questions: Question[]): string => {
  const now = new Date();
  const question = questions[day - 1];
  if (!question) return '';
  
  const status = getQuestionStatus(day, questions);
  
  if (status === 'locked') {
    // Time until opens
    const diff = question.openDate.toDate().getTime() - now.getTime();
    return formatTimeDiff(diff);
  }
  
  if (status === 'available' || status === 'expiring') {
    // Time until expires
    const deadline = new Date(question.openDate.toDate());
    deadline.setDate(deadline.getDate() + 2);
    deadline.setHours(23, 59, 59, 999);
    const diff = deadline.getTime() - now.getTime();
    return formatTimeDiff(diff);
  }
  
  return 'Zakończone';
};

const formatTimeDiff = (diff: number): string => {
  if (diff <= 0) return 'Teraz!';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};