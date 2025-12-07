"use client"
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated snow */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full opacity-70" />
          </div>
        ))}
      </div>

      {/* Christmas lights */}
      <div className="absolute top-0 left-0 right-0 flex justify-around py-4">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full animate-pulse ${
              i % 4 === 0
                ? 'bg-red-500'
                : i % 4 === 1
                ? 'bg-green-500'
                : i % 4 === 2
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-yellow-300 drop-shadow-2xl tracking-wider">
            404
          </h1>
        </div>

        {/* Message box */}
        <div className="bg-red-800/60 backdrop-blur-sm border-4 border-yellow-600/50 rounded-3xl p-8 md:p-12 max-w-2xl mx-auto shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-6 font-serif">
            Ups! Taka strona nie istnieje...
          </h2>
          
          <p className="text-lg md:text-xl text-yellow-100 mb-8 leading-relaxed">
            Wygląda na to, że ta strona do której chcesz się dostać nie istnieje
          </p>

          {/* Return button */}
          <Link
            href="/"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🎄 Powrót do Kalendarza Adwentowego
          </Link>
        </div>

        {/* Decorative elements */}
      
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
}