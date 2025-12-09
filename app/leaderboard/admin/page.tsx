"use client"
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Edit, X } from 'lucide-react';
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
  const [clickedImage, setClickedImage] = useState<string>("")

  const { questions,isLoadedQuestions, listenToQuestions } = useQuestions()
  useEffect(()=>{
    listenToQuestions()
  },[listenToQuestions])

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
  const { isLoaded,listenToUsers,users} = useUsers();
  useEffect(() => {
    listenToUsers();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedSearch])
  function checQuestionType(question:number){
    let hashQuestions={
      1:1,
      2:2,
      3:3,
      4:1,
      5:3,
      6:2,
      7:1,
      8:1,
      9:2,
      10:2,
      11:3,
      12:2,
      13:2,
      14:1,
      15:2,
      16:2,
      17:2,
      18:1,
      19:2,
      20:2,
      21:2,
      22:2,
      23:1,
      24:2,
    } as Record<number,number>
    console.log(`number: ${question}  type: ${hashQuestions[question]}`)
    return hashQuestions[question];
  }
  useEffect(() => {
    const sortAlpahabeticly = users.sort()
    if (searchQuery.trim() === '') {
      setFilteredUsers(sortAlpahabeticly);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        sortAlpahabeticly.filter(
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
                userAnswers&&userAnswers.filter((v)=> checQuestionType(v.questionNumber)==2).map((answer,idx) => (
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
                    <div className="space-y-1 flex">
                      <div>
                      <div className="text-sm">
                      <span className="font-semibold">Pytanie: </span>
                        {questions[answer.questionNumber-1].question}<br/>
                        <span className="font-semibold">Odpowiedź użytkownika:</span>{' '}
                        {answer.answer}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Poprawna odpowiedź:</span>{' '}
                        pytanie otwarte
                      </div>
                      </div>
                      {questions[answer.questionNumber-1].image?<img
                          src={`../${questions[answer.questionNumber-1].image}`}
                          alt={`Obrazek do pytania ${answer.questionNumber}`}
                          onClick={()=>setClickedImage(`../${questions[answer.questionNumber-1].image}`)}
                           className="max-w-full max-h-32 sm:max-h-48 rounded-xl "
                        />:""}
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
