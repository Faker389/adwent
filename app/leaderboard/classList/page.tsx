"use client"
import { useEffect, useState } from "react";
import { useUser, useUsers } from "../../lib/useQuestions";
import { AppUser, Question, userQuestion } from "../../lib/userModel";
import { Medal, Trophy } from "lucide-react";
import { motion } from 'framer-motion';
import useOnlineStatus from "@/app/lib/useIsOnline";

interface objInterface{
        name:string
        score:number
}
export default function Page(){
    const { user, isLoadedUser, listenToUser } = useUser();
  const isOnline = useOnlineStatus();
  const { isLoaded,listenToUsers,users} = useUsers();
  const [userList,setUserList]=useState<Record<string, objInterface[]>>({})
    useEffect(()=>{
        if(isLoaded){
            calcUsers()
        }
    },[isLoaded])
    useEffect(()=>{
        listenToUsers()
    },[listenToUsers])
    useEffect(()=>{
      listenToUser()
  },[listenToUser])
    function sortUsers(users:AppUser[]){
        var data = users.sort((a, b) => {
            const aCorrect = a.questions.filter(q => q.isCorrect === true).length;
            const bCorrect = b.questions.filter(q => q.isCorrect === true).length;
            return bCorrect - aCorrect; // highest first
          });
          return data
    }
    function calcUsers(){
        var obj = {} as Record<string, AppUser[]>
        for(var x=0;x<users.length;x++){
            if(obj[users[x].class]!==undefined){
                obj[users[x].class]=[...obj[users[x].class],users[x]];
            }else{
                obj[users[x].class]=[users[x]];
            }
        }
        var obj2 = {
        }as Record<string, objInterface[]>
        for(var x=0;x<Object.keys(obj).length;x++){
            obj[Object.keys(obj)[x]]=sortUsers(obj[Object.keys(obj)[x]]);
            var data=[]
            for(var y=0;y<obj[Object.keys(obj)[x]].length;y++){
                var obj3 = {
                    name:obj[Object.keys(obj)[x]][y].firstName + " "+ obj[Object.keys(obj)[x]][y].lastName,
                    score:obj[Object.keys(obj)[x]][y].questions.reduce((prev,item)=>{
                        if(item.isCorrect) return prev+1
                        return prev
                    },0)
                }
                data.push(obj3)
            }
            obj2[Object.keys(obj)[x]]=data
        }
        setUserList(obj2)
    }
    useEffect(()=>{
      // Only check email after user data is loaded
      if(!isLoadedUser) return;
      
      // If user is not loaded or email doesn't match allowed emails, redirect
      if(!user || (user.email!=="magkol.594@edu.erzeszow.pl"&&user.email!=="michal200614@gmail.com")){
        window.location.href="/"
        return;
      }
    },[user, isLoadedUser])
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
    if (!isLoaded||!isLoadedUser) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-950">
            <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 animate-pulse">
              Ładowanie...
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-950 py-12 px-4 text-white">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Trophy className="w-16 h-16 text-yellow-400 animate-pulse" />
              </div>
              <h1 className="font-christmas text-6xl font-bold text-yellow-400 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                Wyniki według Klas
              </h1>
              <p className="text-xl font-serif text-red-200">
                Ranking uczniów w poszczególnych klasach
              </p>
            </div>
    
            {/* Class Leaderboards */}
            <div className="space-y-8">
              {Object.keys(userList).sort().map((className, classIndex) => (
                <motion.div
                  key={className}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: classIndex * 0.1 }}
                  className="bg-red-900/50 backdrop-blur-sm border-2 border-yellow-400/50 rounded-3xl p-8 shadow-lg"
                >
                  {/* Class Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-700">
                    <Medal className="w-8 h-8 text-yellow-400" />
                    <h2 className="font-christmas text-4xl font-bold text-yellow-400">
                      Klasa {className}
                    </h2>
                  </div>
    
                  {/* Students List */}
                  <div className="space-y-3">
                    {userList[className].map((student, studentIndex) => (
                      <motion.div
                        key={studentIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: studentIndex * 0.05 }}
                        className="flex items-center justify-between bg-red-800/30 hover:bg-red-800/50 transition-colors rounded-xl p-4 border border-red-700/50"
                      >
                        <div className="flex items-center gap-4">
                          <span className={`font-bold text-lg w-8 ${
                            studentIndex === 0 ? 'text-yellow-400' : 
                            studentIndex === 1 ? 'text-gray-300' : 
                            studentIndex === 2 ? 'text-amber-600' : 
                            'text-white'
                          }`}>
                            {studentIndex + 1}.
                          </span>
                          <span className="font-semibold text-white text-lg">
                            {student.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-2xl ${
                            studentIndex === 0 ? 'text-yellow-400' : 
                            studentIndex === 1 ? 'text-gray-300' : 
                            studentIndex === 2 ? 'text-amber-600' : 
                            'text-white'
                          }`}>
                            {student.score}
                          </span>
                          <span className="text-red-300 text-sm">pkt</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
    
                  {userList[className].length === 0 && (
                    <div className="text-center py-8 text-red-300 font-serif">
                      Brak uczniów w tej klasie
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
    
            {Object.keys(userList).length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-900/50 backdrop-blur-sm border-2 border-yellow-400/50 rounded-3xl p-12 text-center"
              >
                <p className="text-xl text-red-300 font-serif">
                  Brak danych do wyświetlenia
                </p>
              </motion.div>
            )}
          </div>
        </div>
      );
}