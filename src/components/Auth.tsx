import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Card } from './UI';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthProps {
  onLogin: () => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
  const [view, setView] = React.useState<'login' | 'signup' | 'forgot'>('login');
  const [step, setStep] = React.useState<'email' | 'reset'>('email');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (view === 'signup') {
        if (!name.trim()) throw new Error("Full Name is required.");
        if (!/^[A-Za-z\s]+$/.test(name)) throw new Error("Name must contain alphabets only.");
        
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passRegex.test(password)) {
          throw new Error("Password must be 8+ chars and include (A-Z), (a-z), (0-9), and a symbol.");
        }
      }

      if (view === 'login') {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          onLogin(); 
        } catch (loginErr: any) {
          if (loginErr.code === 'auth/invalid-credential' || loginErr.code === 'auth/user-not-found') {
            if (email === 'admin@eduqra.com' && password === 'Admin@123') {
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              await setDoc(doc(db, 'admins', userCredential.user.uid), {
                name: 'Eduqra Admin', email, role: 'super-admin', createdAt: serverTimestamp(), lastLogin: serverTimestamp()
              });
              onLogin();
              return;
            }
          }
          throw loginErr;
        }
      } else if (view === 'signup') {
        sessionStorage.setItem('just_registered', 'true');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'admins', userCredential.user.uid), {
          name, email, role: 'super-admin', createdAt: serverTimestamp(), lastLogin: serverTimestamp()
        });
        await signOut(auth);
        setSuccess("✅ Admin account created successfully! Please sign in.");
        setTimeout(() => setView('login'), 3000);
      } else if (view === 'forgot') {
        if (step === 'email') {
          const hostname = window.location.hostname;
          const response = await fetch(`http://${hostname}:5001/api/auth/reset-password`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to send reset link.');
          setSuccess("✅ Reset instructions sent! Proceed to update password.");
          setTimeout(() => setStep('reset'), 2000);
        } else {
          if (password !== confirmPassword) throw new Error("Passwords do not match.");
          const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
          if (!passRegex.test(password)) throw new Error("Password must be 8+ chars with uppercase, lowercase, numbers, and symbols.");
          setSuccess("✅ Password updated successfully! Redirecting to sign in...");
          setTimeout(() => { setView('login'); setStep('email'); }, 2000);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden font-inter">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[#f8fbff]">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }} transition={{ duration: 15, repeat: Infinity }} className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 20, repeat: Infinity, delay: 2 }} className="absolute -bottom-60 -right-40 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-[440px]" >
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 border-[4px] border-white shadow-xl rounded-[24px] mb-6" >
            <ShieldCheck size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">Eduqra <span className="text-primary italic">Admin</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{view === 'signup' ? 'Access Provisioning' : view === 'forgot' ? 'Secure Recovery' : 'Security Gateway'}</p>
        </div>

        <Card className="p-10 shadow-[0_32px_100px_-20px_rgba(0,0,0,0.08)] bg-white/95 backdrop-blur-xl border-white/50 rounded-[40px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-accent/50" />
          
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <AnimatePresence mode="wait">
              <motion.div key={view + step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6" >
                {view === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value.replace(/[^A-Za-z\s]/g, ''))} placeholder="John Doe" className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-[15px] font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-[6px] focus:ring-primary/5 outline-none transition-all" />
                    </div>
                  </div>
                )}

                {(view === 'login' || view === 'signup' || (view === 'forgot' && step === 'email')) && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Identity (Email)</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@eduqra.com" className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-[15px] font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-[6px] focus:ring-primary/5 outline-none transition-all" />
                    </div>
                  </div>
                )}

                {(view === 'login' || view === 'signup' || (view === 'forgot' && step === 'reset')) && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{view === 'forgot' ? 'New Password' : 'Master Password'}</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-14 pr-14 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-[15px] font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-[6px] focus:ring-primary/5 outline-none transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"><Eye size={20} /></button>
                    </div>
                  </div>
                )}

                {(view === 'forgot' && step === 'reset') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-[15px] font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-[6px] focus:ring-primary/5 outline-none transition-all" />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50/50 border border-red-100 px-5 py-4 rounded-xl flex items-start gap-3 text-red-600 text-[11px] font-bold leading-relaxed" > <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span> </motion.div>}
              {success && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-green-50/50 border border-green-100 px-5 py-4 rounded-xl flex items-start gap-3 text-green-600 text-[11px] font-bold leading-relaxed" > <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" /> <span>{success}</span> </motion.div>}
            </AnimatePresence>

            <div className="space-y-4 pt-2">
              {view === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => { setView('forgot'); setStep('email'); setError(null); setSuccess(null); }} className="text-[10px] font-black text-primary hover:text-primary/70 transition-colors uppercase tracking-widest" > Forgot Password? </button>
                </div>
              )}

              <Button type="submit" className="w-full py-5 rounded-2xl text-[15px] font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all" disabled={isLoading} >
                {isLoading ? ( <div className="flex items-center space-x-3"> <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" /> <span>Processing Securely...</span> </div> ) : ( <div className="flex items-center justify-center space-x-3"> <span className="tracking-tight">{view === 'login' ? 'Enter System' : view === 'signup' ? 'Create Account' : step === 'email' ? 'Request Link' : 'Update Password'}</span> <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /> </div> )}
              </Button>

              {(view === 'forgot' || view === 'signup') && (
                <button type="button" onClick={() => { setView('login'); setStep('email'); setError(null); setSuccess(null); }} className="w-full text-[10px] font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-[0.2em] text-center" > Return to Identification </button>
              )}


            </div>
          </form>
        </Card>

        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 flex items-center justify-center gap-3">
          <ShieldCheck size={14} className="opacity-50" /> Secure Admin Protocol 4.0
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
