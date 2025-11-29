import { useEffect } from "react";
import "./globals.css";

export default function TempLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    useEffect(() => {
        const setVH= ()=>{
            document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
        }
        setVH();
        window.addEventListener('resize', setVH);
        return () => {
            window.removeEventListener('resize', setVH);
        }
    },[])
  return (
    <>
      {children}
    </>
  );
}
