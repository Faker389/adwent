"use client"
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';
import { Sparkles, Gift, Eye, EyeClosed } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { saveUserToCookies } from '../lib/cookies';
import { AppUser } from '../lib/userModel';

export const RegistrationForm = ({showAlert}:{showAlert :(e: string,e2:"error" | "success" | "warning") => void }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    class: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  async function handleRegister() {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password.trim()
      );
  
      const uid = userCredential.user.uid; // <-- HERE
  
      return uid; // return uid instead of true
    } catch (error) {
      showAlert("Nie udało sie zarejestrować","error")
      return null; // return null instead of false
    }
  }
  
  async function addUserToDB(uid:string) {
    const data ={
      firstName:formData.firstName,
      lastName:formData.lastName,
      email:formData.email,
      class:formData.class,
      questions:Array.from({length:24}).map((e,idx)=>{
        return {
          questionNumber:idx+1,
          answer: null,
          isCorrect: null,
        }
      })
    }
    try {
      await setDoc(doc(db, "users", uid), data, { merge: true });
      return true
    } catch (error) {
      showAlert("Nie udało sie zapisać użytkownika","error")
      return null
    }
  }
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
    const uuid = await handleRegister()
    if(!uuid) return showAlert(
      "Rejestracja nieudana! ","error"
    )
    const resp  =await addUserToDB(uuid)
    if(!resp) return showAlert(
      "Rejestracja nieudana! ","error"
    )
    const resp2 = await getUserById(uuid)
    await new Promise(resolve => setTimeout(resolve, 500));
    if(!resp2) return showAlert(
      "Zapisywanie użytkownika nieudane! ","error"
    )
    showAlert("Rejestracja zakończona! 🎄","success");
    window.location.href="/"
    setFormData({ firstName: '', lastName: '', email: '', class: '', password: '' });
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto p-8 bg-gradient-to-b from-red-900/90 to-red-950/90 backdrop-blur-lg border-2 border-yellow-400/50 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-red-600/5 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gift className="w-10 h-10 text-yellow-400 animate-pulse" />
          <h2 className="font-christmas text-4xl font-bold text-yellow-400" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Rejestracja
          </h2>
          <Sparkles className="w-10 h-10 text-red-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <p className="text-red-200 font-serif">
          Dołącz do świątecznej przygody!
        </p>
      </div>

      {/* Decorative divider */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
        <span className="text-yellow-400 text-xl">🎄</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-white font-serif">
            Imię
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="Twoje imię"
            className="bg-red-800/50 border-red-700 text-white placeholder:text-red-300/50 h-12 rounded-xl focus:border-yellow-400"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-white font-serif">
            Nazwisko
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Twoje nazwisko"
            className="bg-red-800/50 border-red-700 text-white placeholder:text-red-300/50 h-12 rounded-xl focus:border-yellow-400"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-serif">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="twoj@email.pl"
            className="bg-red-800/50 border-red-700 text-white placeholder:text-red-300/50 h-12 rounded-xl focus:border-yellow-400"
            required
          />
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="class" className="text-white font-serif">
            Klasa
          </Label>
          <Select value={formData.class} onValueChange={(value: string) => setFormData({ ...formData, class: value })}>
            <SelectTrigger className="bg-red-800/50 z-50 border-red-700  text-white h-12 rounded-xl focus:border-yellow-400">
              <SelectValue placeholder="Wybierz klasę" />
            </SelectTrigger>
            <SelectContent className="bg-red-900 border-red-700 max-h-64 overflow-y-auto">
            <SelectItem value="1AT">1AT</SelectItem>
              <SelectItem value="1BT">1BT</SelectItem>
              <SelectItem value="1DT">1DT</SelectItem>
              <SelectItem value="1ET">1ET</SelectItem>
              <SelectItem value="1LOA">1LOA</SelectItem>
              <SelectItem value="2AT">2AT</SelectItem>
              <SelectItem value="2BT">2BT</SelectItem>
              <SelectItem value="2DT">2DT</SelectItem>
              <SelectItem value="2LOA">2LOA</SelectItem>
              <SelectItem value="3AT">3AT</SelectItem>
              <SelectItem value="3BT">3BT</SelectItem>
              <SelectItem value="3CT">3CT</SelectItem>
              <SelectItem value="3DT">3DT</SelectItem>
              <SelectItem value="3ET">3ET</SelectItem>
              <SelectItem value="3FT">3FT</SelectItem>
              <SelectItem value="3GT">3GT</SelectItem>
              <SelectItem value="3LOA">3LOA</SelectItem>
              <SelectItem value="3LOB">3LOB</SelectItem>
              <SelectItem value="4AT">4AT</SelectItem>
              <SelectItem value="4BT">4BT</SelectItem>
              <SelectItem value="4CT">4CT</SelectItem>
              <SelectItem value="4DT">4DT</SelectItem>
              <SelectItem value="4ET">4ET</SelectItem>
              <SelectItem value="4FT">4FT</SelectItem>
              <SelectItem value="4GT">4GT</SelectItem>
              <SelectItem value="4LOA">4LOA</SelectItem>
              <SelectItem value="4LOB">4LOB</SelectItem>
              <SelectItem value="5AT">5AT</SelectItem>
              <SelectItem value="5BT">5BT</SelectItem>
              <SelectItem value="5CT">5CT</SelectItem>
              <SelectItem value="5DT">5DT</SelectItem>
              <SelectItem value="5ET">5ET</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-serif">
            Hasło
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword?"text":"password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value.trim().slice(0,30) })}
              placeholder="••••••••"
              className="bg-red-800/50 border-red-700 text-white placeholder:text-red-300/50 h-12 rounded-xl focus:border-yellow-400 pr-12"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-white hover:text-yellow-400 transition-colors"
            >
              {showPassword ? <EyeClosed className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
            </button>
          </div>
            <p className='text-red-500 mt-2'>Maksymalna długość hasła to 30 znaków.</p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold text-lg rounded-xl shadow-lg transition-all duration-300 mt-8"
        >
          {loading ? 'Rejestracja...' : 'Zarejestruj się 🎁'}
        </Button>
      </form>

      {/* Decorative corner elements */}
      <div className="absolute top-4 right-4 text-yellow-400 text-xl animate-pulse">✨</div>
      <div className="absolute bottom-4 left-4 text-yellow-400 text-xl animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>
    </motion.div>
  );
};
