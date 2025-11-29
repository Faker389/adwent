"use client"
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Snowflakes } from "../components/Snowflakes";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-red-950 via-red-900 to-red-950">
      <Snowflakes />
      <div className="text-center relative z-10">
        <h1 className="mb-4 font-christmas text-8xl font-bold text-yellow-400" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          404
        </h1>
        <p className="mb-4 text-xl text-red-200 font-serif">Ups! Strona nie została znaleziona</p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Wróć do kalendarza 🎄
        </a>
      </div>
    </div>
  );
};

export default NotFound;
