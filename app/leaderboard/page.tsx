"use client"
import { Snowflakes } from '../components/Snowflakes';
import { Leaderboard } from '../components/Leaderboard';
import { useEffect } from 'react';
import { getCurrentUser } from '../lib/firebase';
import { useUser } from '../lib/useQuestions';

const LeaderboardPage = () => {
  const { user, isLoadedUser, listenToUser } = useUser();
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
    if(user?.email!=="magkol.594@edu.erzeszow.pl"&&user?.email!=="michal200614@gmail.com"){
      window.location.href="/"
      return;
    }
  },[user])
  useEffect(()=>{
    getuser()
  },[])
  return (
    <div className="min-h-dvh bg-gradient-to-b from-red-950 via-red-900 to-red-950">
      <Snowflakes />
      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;
