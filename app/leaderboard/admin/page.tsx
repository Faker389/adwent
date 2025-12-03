"use client"
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Input } from '../../components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Snowflakes } from '../../components/Snowflakes';
import { useQuestions, useUser, useUsers } from '@/app/lib/useQuestions';
import { ABCOption, AppUser, Question } from '@/app/lib/userModel';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, getCurrentUser } from '@/app/lib/firebase';
import useOnlineStatus from '@/app/lib/useIsOnline';



// Demo data
interface userQuestions{
    questionNumber: number;
    question: string;
    answer: string;
    isCorrect: boolean|null;
}

export default function AdminLeaderboard() {
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([]);
  const { user, isLoadedUser, listenToUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [selectedQuestionsToApprove, setSelectedQuestionsToApprove] = useState<number[]>([]);
  const isOnline = useOnlineStatus();
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const router = useRouter();
  const { questions,isLoadedQuestions, listenToQuestions } = useQuestions()
  useEffect(()=>{
    listenToQuestions()
  },[listenToQuestions])
  const { isLoaded,listenToUsers,users} = useUsers();
  useEffect(() => {
    listenToUsers();
  }, []);
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedSearch])
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.class.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const userAnswers = selectedUser&&selectedUser?.questions.reduce((prev:userQuestions[],items)=>{
    if(items.answer!==null) {prev.push(items); return prev;}
    return prev
  },[])

  async function getuser(){
    const userFromCookies = await getCurrentUser()
    if(!userFromCookies) {
      window.location.href="/auth"
      return;
    }
  }
  useEffect(()=>{
    listenToUser()
  },[listenToUser])

  useEffect(()=>{
    getuser()
  },[])
  const handleUserClick = (user: AppUser) => {
    setSelectedUser(user);
    setSelectedQuestionsToApprove([]);
  };

   useEffect(()=>{
    // Only check email after user data is loaded
    if(!isLoadedUser) return;
    
    // If user is not loaded or email doesn't match allowed emails, redirect
    if(!user || (user.email!=="magkol.594@edu.erzeszow.pl"&&user.email!=="michal200614@gmail.com")){
      window.location.href="/"
      return;
    }
  },[user, isLoadedUser])

  async function handleApproveSelectedQuestions() {
    if (!selectedUser || selectedQuestionsToApprove.length === 0) return;
    try {
      setLoadingAnswers(true);

      // Build a single updated questions array and write once to Firestore
      const userRef = doc(db, "users", selectedUser.id);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error("User document not found");
      }

      const userData = userSnap.data() as AppUser;
      const selectedSet = new Set(selectedQuestionsToApprove);

      const updatedQuestions = userData.questions.map((q) => {
        if (!selectedSet.has(q.questionNumber)) return q;

        const questionMeta = questions[q.questionNumber - 1];
        if (!questionMeta) return q;

        // Mirror the logic from updateUserQuestion: for type 2 we only flip isCorrect,
        // for others we also ensure answer is stored from questions metadata
        if (questionMeta.questionType === 2) {
          return { ...q, isCorrect: true };
        }

        return {
          ...q,
          answer: questionMeta.answer ?? q.answer,
          isCorrect: true,
        };
      });

      await updateDoc(userRef, { questions: updatedQuestions });

      
      setSelectedQuestionsToApprove([]);
      setSelectedUser(null)
      // Optionally keep modal open so admin can continue reviewing
    } catch (error) {
      console.error("Error approving selected questions:", error);
    } finally {
      setLoadingAnswers(false);
    }
  }
   function getUserAnswear(userAnswear:userQuestions,question:Question){
      if(question.questionType==2){
        return userAnswear.answer;
      }else if(question.questionType==1){
          const data = question.options as ABCOption;
          switch(userAnswear.answer){
            case "a":return data.a;break;
            case "b":return data.b;break;
            case "c":return data.c;break;
          }
      }else if(question.questionType==3){
        if(userAnswear.answer=="t") return "richtig";
        if(userAnswear.answer=="f") return "falsch";
      }
   }
   function getCorrectAnswear(userAnswear:userQuestions,question:Question){
    if(question.questionType==2){
      return "pytanie otwarte";
    }else if(question.questionType==1){
        const data = question.options as ABCOption;
        switch(question.answer){
          case "a":return data.a;break;
          case "b":return data.b;break;
          case "c":return data.c;break;
        }
    }else if(question.questionType==3){
      switch(question.answer){
        case "f":return "falsch";break;
        case "t":return "richtig";break;
      }
    }
 }
 function checkIfSelected(answer:userQuestions){
  let data;
  selectedQuestionsToApprove.includes(answer.questionNumber)?
  data=(selectedQuestionsToApprove.filter((q) => q !== answer.questionNumber)):
  data=([...selectedQuestionsToApprove, answer.questionNumber])
  setSelectedQuestionsToApprove(data)
 }
 if(!isOnline){
  return (
    <div className="min-h-dvh bg-gradient-to-b from-red-950 via-red-900 to-red-950 flex items-center justify-center">
      <div className="text-center">
        <p className="font-christmas text-2xl text-red-400">Jesteś offline połącz się z internetem i spróbuj ponownie.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl"
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
}
  if (!isLoaded||!isLoadedQuestions) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gradient-to-b from-red-950 via-red-900 to-red-950">
        <div className="text-2xl font-christmas text-yellow-400 animate-pulse">
          Ładowanie...
        </div>
      </div>
    );
  }

  return (
    <>
      <Snowflakes />
      <div className="min-h-dvh bg-gradient-to-b from-red-950 via-red-900 to-red-950 py-12 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Button
              onClick={() => router.push('/leaderboard')}
              variant="outline"
              className="mb-8 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
            >
              ← Powrót do tabeli wyników
            </Button>

            <h1 className="font-christmas text-6xl font-bold text-yellow-400 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Panel Administratora
            </h1>
            <p className="text-xl text-red-200 font-serif">
              Przeglądaj i zatwierdzaj odpowiedzi użytkowników
            </p>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300 w-5 h-5" />
              <Input
                type="text"
                placeholder="Szukaj użytkownika..."
                value={debouncedSearch}
                onChange={(e) => setDebouncedSearch(e.target.value)}
                className="pl-12 py-6 text-lg bg-red-900/50 border-red-700 focus:border-yellow-400 text-white placeholder:text-red-300/50"
              />
            </div>
          </motion.div>

          {/* Users List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-red-900/50 backdrop-blur-lg border-2 border-yellow-400/50 rounded-3xl p-8 shadow-2xl"
          >
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-red-300 font-serif">
                  Nie znaleziono użytkowników
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center justify-between p-4 rounded-xl bg-red-800/50 border border-red-700 hover:border-yellow-400 hover:bg-red-700/50 cursor-pointer transition-all"
                  >
                    <div>
                      <div className="font-semibold text-white text-lg">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-red-300">
                        Klasa {user.class} • {user.email}
                      </div>
                    </div>
                    <Edit className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* User Answers Modal */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-red-900 border-2 border-yellow-400/50 text-white">
            <DialogHeader>
              <DialogTitle className="font-christmas text-3xl text-yellow-400">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogTitle>
              <p className="text-red-300">
                Klasa {selectedUser?.class} • {selectedUser?.email}
              </p>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              {loadingAnswers ? (
                <div className="text-center py-8 text-red-300">
                  Ładowanie odpowiedzi...
                </div>
              ) : userAnswers&&userAnswers.length === 0 ? (
                <div className="text-center py-8 text-red-300">
                  Użytkownik nie odpowiedział jeszcze na żadne pytanie
                </div>
              ) : (
                userAnswers&&userAnswers.map((answer,idx) => (
                  <div
                      onClick={() => {
                        checkIfSelected(answer)
                      }}
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${
                      answer.isCorrect
                        ? 'bg-green-900/30 border-green-500'
                        : 'bg-red-800/30 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2"
                    
                    >
                      <div className="flex items-center gap-2">
                      {!answer.isCorrect ? 
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-yellow-400"
                          checked={selectedQuestionsToApprove.includes(answer.questionNumber)}
                          onChange={() => {
                             checkIfSelected(answer)
                          }}
                        />:""}
                        <div className="font-bold text-yellow-400">
                          Dzień {answer.questionNumber}
                        </div>
                      </div>
                      {answer.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="text-sm text-red-200 mb-2">
                      {answer.question}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm">
                      <span className="font-semibold">Pytanie: </span>
                        {questions[answer.questionNumber-1].question}<br/>
                        <span className="font-semibold">Odpowiedź użytkownika:</span>{' '}
                        {getUserAnswear(answer,questions[answer.questionNumber-1])}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Poprawna odpowiedź:</span>{' '}
                        {getCorrectAnswear(answer,questions[answer.questionNumber-1])}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedQuestionsToApprove.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleApproveSelectedQuestions}
                  disabled={loadingAnswers}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {`Zatwierdź ${selectedQuestionsToApprove.length} pytań`}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
