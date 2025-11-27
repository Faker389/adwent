"use client"
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { AppUser } from '../lib/userModel';
import { useUsers } from '../lib/useQuestions';





export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<AppUser[]>([]);
  const router = useRouter();
  const { isLoaded,listenToUsers,users} = useUsers();
  useEffect(() => {
    listenToUsers();
  }, []);
 
  useEffect(() => {
      setLeaderboard(users);
  }, [users]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 animate-pulse">
          Ładowanie...
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen py-12 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 gap-6">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="mb-8 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
          >
            ← Powrót do kalendarza
          </Button>
          <Button
            onClick={() => router.push('/leaderboard/admin')}
            variant="outline"
            className="mb-8 ml-6 border-green-400 text-green-400 hover:bg-green-400/10"
          >
            Panel zarządzania →
          </Button>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <Trophy className="w-16 h-16 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="font-christmas text-6xl font-bold text-yellow-400 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Tabela Wyników
          </h1>
          <p className="text-xl font-serif text-red-200">
            Zobacz kto zebrał najwięcej poprawnych odpowiedzi
          </p>
        </div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-red-900/50 backdrop-blur-sm border-2 border-yellow-400/50 rounded-3xl p-8 shadow-lg overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-red-700">
                <th className="text-left py-4 px-4 font-extrabold text-yellow-400 text-xl">#</th>
                <th className="text-left py-4 px-4 font-extrabold text-yellow-400 text-xl">Imię i Nazwisko</th>
                <th className="text-center py-4 px-2 font-extrabold text-yellow-400 text-sm">
  <div className="grid grid-cols-24 gap-1">
    {Array.from({ length: 24 }, (_, i) => (
      <span key={i} className="w-6 text-center block">
        {i + 1}
      </span>
    ))}
  </div>
</th>

                <th className="text-center py-4 px-4 font-extrabold text-yellow-400 text-xl">Suma</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-red-800/50 hover:bg-red-800/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                      {index === 1 && <Star className="w-5 h-5 text-gray-300" />}
                      {index === 2 && <Star className="w-5 h-5 text-amber-600" />}
                      <span className={`font-bold ${index < 3 ? 'text-yellow-400' : 'text-white'}`}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-semibold text-white">
                        {entry.firstName} {entry.lastName}
                      </div>
                      <div className="text-sm text-red-300">
                        Klasa {entry.class}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-1 justify-center">
                      {entry.questions.map((correct, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            correct.isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-800/50 text-red-400'
                          }`}
                        >
                          {correct.isCorrect ? '✓' : ''}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-bold text-xl ${index < 3 ? 'text-yellow-400' : 'text-white'}`}>
                      {entry.questions.reduce((prev,items)=>{
                        if(items.isCorrect) return prev+1
                        return prev
                      },0)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-red-300 font-serif">
              Brak wyników. Bądź pierwszy, który odpowie na pytania!
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
