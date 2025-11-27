"use client"
import { Snowflakes } from '../components/Snowflakes';
import { Leaderboard } from '../components/Leaderboard';
import { useEffect } from 'react';
import { getCurrentUser } from '../lib/firebase';

const LeaderboardPage = () => {
  async function getuser(){
    const userFromCookies = await getCurrentUser()
    if(!userFromCookies) {
      window.location.href="/auth"
      return;
    }
  }
  useEffect(()=>{
    getuser()
  },[])
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-950">
      <Snowflakes />
      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;
