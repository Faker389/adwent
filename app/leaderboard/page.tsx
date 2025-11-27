"use client"
import { Snowflakes } from '../components/Snowflakes';
import { Leaderboard } from '../components/Leaderboard';

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-950">
      <Snowflakes />
      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;
