import { Timestamp } from "firebase/firestore";

export interface AppUser {
    id:string
    class: string;
    email: string;
    firstName: string;
    lastName: string;
    questions: {
      questionNumber: number;
      question: string;
      answer: string;
      isCorrect: boolean|null;
    }[];
  }

  export interface ABCOption {
    a: string;
    b: string;
    c: string;
  }
  
 export interface TrueFalseOption {
    t: string;
    f: string;
  }
  
 export interface Question {
    questionNumber: number;
    questionType: 1| 2 | 3;
    openDate:Timestamp;
    question: string;
    answer?: string|null;
    options?: ABCOption | TrueFalseOption;
    image?: string;
  }
  
 