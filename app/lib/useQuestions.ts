import { create } from "zustand"
import { auth, db } from "../lib/firebase"
import { collection, doc, onSnapshot, Timestamp } from "firebase/firestore"
import { AppUser, Question } from "./userModel"
import { onAuthStateChanged } from 'firebase/auth';

interface ProductStore {
  questions: Question[]
  isLoadedQuestions: boolean
  unsubscribe?: () => void
  listenToQuestions: () => void
}

export const useQuestions = create<ProductStore>((set, get) => ({
  questions: [],
  isLoadedQuestions: false,

  listenToQuestions: () => {
    if (get().unsubscribe) return // already listening

    const unsub = onSnapshot(
      collection(db, "questions"),
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => doc.data() as Question)
          .sort((a, b) => a.questionNumber - b.questionNumber) // Sort by question number

        set({ questions: data, isLoadedQuestions: true })
      },
      (error) => {
        console.error("Error fetching questions:", error)
        set({ isLoadedQuestions: true }) // Still mark as loaded even on error
      }
    )

    set({ unsubscribe: unsub })
  },
}))




interface UserStore {
  users: AppUser[]
  isLoaded: boolean
  unsubscribe?: () => void
  listenToUsers: () => void
}

export const useUsers = create<UserStore>((set, get) => ({
  users: [],
  isLoaded: false,

  listenToUsers: () => {
    if (get().unsubscribe) return // already listening

    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as AppUser)
    
      set({ users: data, isLoaded: true })
    })
    

    set({ unsubscribe: unsub })
  },
}))



interface UserStore2 {
  user: AppUser | null
  isLoadedUser: boolean
  unsubscribe?: () => void
  authUnsubscribe?: () => void
  listenToUser: () => void
  stopListening: () => void
}

export const useUser = create<UserStore2>((set, get) => ({
  user: null,
  isLoadedUser: false,

  listenToUser: () => {
    if (get().authUnsubscribe) return // already listening

    // Listen to auth state changes
    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous user listener if exists
      const prevUnsub = get().unsubscribe;
      if (prevUnsub) {
        prevUnsub();
        set({ unsubscribe: undefined });
      }

      if (!firebaseUser) {
        // User logged out
        set({ user: null, isLoadedUser: true });
        return;
      }

      // Listen to the specific user document
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userUnsub = onSnapshot(
        userDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data() as AppUser;
            set({ user: userData, isLoadedUser: true });
          } else {
            // User document doesn't exist
            set({ user: null, isLoadedUser: true });
          }
        },
        (error) => {
          console.error("Error listening to user:", error);
          set({ user: null, isLoadedUser: true });
        }
      );

      set({ unsubscribe: userUnsub });
    });

    set({ authUnsubscribe: authUnsub });
  },

  stopListening: () => {
    const { unsubscribe, authUnsubscribe } = get();
    
    if (unsubscribe) {
      unsubscribe();
    }
    if (authUnsubscribe) {
      authUnsubscribe();
    }
    
    set({ 
      unsubscribe: undefined, 
      authUnsubscribe: undefined,
      user: null,
      isLoadedUser: false 
    });
  },
}))