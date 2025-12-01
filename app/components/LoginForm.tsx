"use client"
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { Sparkles, Gift, Eye, EyeClosed } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AppUser } from '../lib/userModel';
import { saveUserToCookies } from '../lib/cookies';

interface LoginFormProps {
  onSuccess?: () => void;
  showAlert :(e: string,e2:"error" | "success" | "warning") => void 

}

export const LoginForm = ({ onSuccess,showAlert }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  async function getUserById(uid:string) {
   
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        return null;
      }
  
      const userData = userSnap.data() as AppUser;
      await saveUserToCookies(userData)
      return true
    } catch (error) {
      return null
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );
      const uuid= userCredentials.user.uid;
      const resp = await getUserById(uuid)
      if(!resp) return showAlert(
        "Zapisywanie użytkownika nieudane! ","error"
      )
      showAlert("Zalogowano!","success");
      await new Promise(resolve => setTimeout(resolve, 500));
      onSuccess?.();
      window.location.href="/"

    } catch (error) {
      showAlert("Nie udało się zalogować!","error")
      return;
    }finally{
      setLoading(false);
    }
    // Simulate login delay
    
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto p-8 bg-gradient-to-b from-red-900/90 to-red-950/90 backdrop-blur-lg border-2 border-yellow-400/50 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-red-600/5 pointer-events-none" />
      
      <div className="relative z-10 text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
          <h2 className="font-christmas text-4xl font-bold text-yellow-400" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Logowanie
          </h2>
          <Gift className="w-10 h-10 text-red-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <p className="text-red-200 font-serif">
          Kontynuuj swoją świąteczną przygodę!
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
        <span className="text-yellow-400 text-xl">🎄</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-serif">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            className="bg-red-800/50 border-red-700 text-white placeholder:text-red-300/50 h-12 rounded-xl focus:border-yellow-400"
            required
          />
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="password" className="text-white font-serif">
            Hasło
          </Label>
          <Input
            id="password"
            type={showPassword?"text":"password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-red-800/50 border-red-700 text-white placeholder:text-red-300/50 h-12 rounded-xl focus:border-yellow-400"
            required
          />
          {!showPassword?<Eye onClick={()=>setShowPassword(!showPassword)} className='w-5 h-5 absolute top-1/2 right-3 z-50' />:<EyeClosed onClick={()=>setShowPassword(!showPassword)} className='w-5 h-5 absolute top-1/2 right-3 z-50' />}

        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold text-lg rounded-xl shadow-lg transition-all duration-300 mt-8"
        >
          {loading ? 'Logowanie...' : 'Zaloguj się 🎁'}
        </Button>
      </form>

      <div className="absolute top-4 right-4 text-yellow-400 text-xl animate-pulse">✨</div>
      <div className="absolute bottom-4 left-4 text-yellow-400 text-xl animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>
    </motion.div>
  );
};
