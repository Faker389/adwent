"use client"
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../components/LoginForm';
import { RegistrationForm } from '../components/RegistrationForm';
import { Snowflakes } from '../components/Snowflakes';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import useOnlineStatus from '../lib/useIsOnline';
interface Alert {
  id: string
  message: string
  type: 'error' | 'success' | 'warning'
}
const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([])
  const isOnline = useOnlineStatus();
  const showAlert = useCallback((message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      message,
      type
    }
    
    setAlerts(prev => [...prev, newAlert])
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id))
    }, 3000)
  }, [])
  const getAlertStyles = (type: 'error' | 'success' | 'warning') => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-400'
      case 'warning':
        return 'bg-yellow-600 border-yellow-400'
      case 'error':
      default:
        return 'bg-red-600 border-red-400'
    }
  }
  useEffect(()=>{
    setMounted(true)
  },[])
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
  if(!mounted){
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 animate-pulse">
          Ładowanie...
        </div>
      </div>
    );
  }
  return (

    <div className="min-h-dvh z-50 bg-gradient-to-b from-red-950 via-red-900 to-red-950 text-white">
      <Snowflakes />
      <div className="fixed top-8 right-8 z-50 space-y-3 max-w-md">
        <AnimatePresence  >
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${getAlertStyles(alert.type)} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border-2`}
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold">{alert.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Background */}
      <div className="fixed inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/christmas-hero.jpg)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/90 via-red-900/80 to-red-950" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-dvh flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {showForgotPassword ? (
            <ForgotPasswordForm showAlert={showAlert} onBack={() => setShowForgotPassword(false)} />
          ) : showLogin ? (
            <LoginForm showAlert={showAlert} onSuccess={() => window.location.href = '/'} />
          ) : (
            <RegistrationForm showAlert={showAlert} />
          )}

          {!showForgotPassword && (
            <div className="mt-6 text-center space-y-2">
              <button
                onClick={() => setShowLogin(!showLogin)}
                className="block w-full text-yellow-400 hover:text-yellow-300 font-serif transition-colors underline"
              >
                {showLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
              </button>
              {showLogin && (
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="block w-full text-red-300 hover:text-yellow-400 font-serif transition-colors text-sm"
                >
                  Zapomniałeś hasła?
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
