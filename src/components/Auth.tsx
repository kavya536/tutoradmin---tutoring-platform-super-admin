import * as React from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button, Card } from './UI';

interface AuthProps {
  onLogin: () => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
  const [email, setEmail] = React.useState('admin@tutoradmin.com');
  const [password, setPassword] = React.useState('password123');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-2xl shadow-primary/20 mb-6">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Eduqra <span className="text-primary italic">Admin</span></h1>
          <p className="text-gray-500 font-medium mt-2">Sign in to manage the Eduqra ecosystem.</p>
        </div>

        <Card className="p-8 shadow-2xl shadow-gray-200/50 border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 font-black text-base shadow-xl shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Login as Admin</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </Button>
          </form>
        </Card>

      </motion.div>
    </div>
  );
};
