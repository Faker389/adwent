"use client"
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Snowflakes } from './components/Snowflakes';
import { CalendarWindow } from './components/CalendarWindow';
import { QuestionModal } from './components/QuestionModal';
import { PathConnector } from "./components/PathConnector";
import { LogOut, Trophy, Loader2 } from 'lucide-react';
import { AppUser, Question } from './lib/userModel';
import { getUserFromCookies, logoutUser } from './lib/cookies';
import { auth, db } from './lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useQuestions, useUser } from './lib/useQuestions';
const Index = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { questions, isLoadedQuestions, listenToQuestions } = useQuestions()
  const { user, isLoadedUser, listenToUser } = useUser();

  useEffect(() => {
    listenToUser();
  }, []);
  // Start listening to questions on mount
  useEffect(() => {
    listenToQuestions()
  }, [listenToQuestions])
  useEffect(() => {
    listenToUser()
  }, [listenToUser])

  // Create a winding path layout - windows positioned to create an interesting journey
  const windowPositions = useMemo(() => {
    const basePositions: [number, number][] = [
      [15, 8], [40, 5], [65, 10], [88, 6],
      [85, 22], [60, 25], [35, 20], [12, 24],
      [18, 38], [42, 42], [68, 36], [90, 40],
      [82, 55], [55, 58], [30, 54], [8, 58],
      [20, 72], [48, 75], [72, 70], [92, 74],
      [78, 88], [50, 92], [25, 88], [10, 95],
    ];

    return basePositions.map(([x, y], i) => {
      const offsetX = (Math.random() - 0.5) * 6;
      const offsetY = (Math.random() - 0.5) * 4;
      const rotation = (Math.random() - 0.5) * 10;
      
      return {
        xPercent: Math.max(5, Math.min(95, x + offsetX)),
        yPercent: y + offsetY,
        rotation,
        day: i + 1,
      };
    });
  }, []);

  async function logoutUserFkc(){
    await logoutUser()
    await auth.signOut()
    window.location.href="/auth"
  }

  const pathPoints = useMemo(() => {
    return windowPositions.map((pos) => ({
      x: pos.xPercent,
      y: pos.yPercent,
    }));
  }, [windowPositions]);

  // Show loading screen while questions are being fetched
  if (!isLoadedQuestions||!isLoadedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="font-christmas text-2xl text-yellow-400">Ładowanie kalendarza...</p>
        </div>
      </div>
    );
  }

  // Show error if no questions loaded
  if (isLoadedQuestions && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <p className="font-christmas text-2xl text-red-400">Nie udało się załadować pytań.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-950 text-white overflow-x-hidden">
      <Snowflakes />

      {/* Fixed Header with Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="flex justify-end items-center gap-2 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href=('/leaderboard')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-400 flex items-center gap-2 backdrop-blur-sm"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Tabela Wyników</span>
            <span className="sm:hidden">Wyniki</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logoutUserFkc}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-red-800/80 hover:bg-red-700/80 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all duration-300 border-2 border-red-600 flex items-center gap-2 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Wyloguj</span>
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/christmas-hero.jpg)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/80 via-red-900/60 to-red-950" />
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-christmas text-6xl sm:text-8xl md:text-9xl font-bold mb-6 text-yellow-400 drop-shadow-2xl" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
              Kalendarz Adwentowy
            </h1>
            <p className="font-serif text-xl sm:text-2xl md:text-3xl mb-12 drop-shadow-lg text-white/90 italic">
              24 dni pełnych świątecznej magii ✨
            </p>
          </motion.div>
        </div>

        {/* Decorative lights */}
        <div className="absolute top-20 left-0 right-0 flex justify-around px-4 sm:px-8 z-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse"
              style={{
                backgroundColor: i % 3 === 0 ? '#facc15' : i % 3 === 1 ? '#22c55e' : '#ef4444',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="relative bg-gradient-to-b from-red-950 via-red-900 py-12 sm:py-20 px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-8 sm:mb-16"
        >
          <h2 className="font-christmas text-4xl sm:text-6xl md:text-7xl font-bold text-yellow-400 mb-4 px-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Odkryj Codzienną Niespodziankę
          </h2>
          <p className="font-serif text-lg sm:text-xl text-red-200 italic">
            Kliknij okienko, aby zobaczyć pytanie dnia
          </p>
        </motion.div>

        {/* Calendar Grid with Path */}
        <div 
          className="relative mx-auto w-full max-w-5xl"
          style={{ 
            aspectRatio: '1 / 1.2',
            minHeight: '600px',
          }}
        >
          <PathConnector windows={pathPoints} />
          
          {windowPositions.map((pos, i) => (
            <CalendarWindow
              key={i + 1}
              day={questions[i]?.questionNumber || i + 1}
              questions={questions}
              onClick={() => setSelectedDay(i + 1)}
              style={{
                position: 'absolute',
                left: `${pos.xPercent}%`,
                top: `${pos.yPercent}%`,
                transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 sm:py-12 text-center border-t border-red-800">
        <p className="font-christmas text-red-200 text-xl sm:text-2xl">
          Wesołych Świąt! 🎄✨
        </p>
      </footer>

      {/* Question Modal */}
      <QuestionModal
        day={selectedDay || 1}
        isAnsweared={user?.questions[(selectedDay || 1)-1].answer!=null}
        questions={questions}
        isOpen={selectedDay !=null}
        onClose={() => setSelectedDay(null)}
        onAnswerSubmitted={() => {}}
      />
    </div>
  );
};

export default Index;