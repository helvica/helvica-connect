import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bot, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      
      {/* Premium Apple-style background blur effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-100/40 to-purple-100/40 dark:from-indigo-900/20 dark:to-purple-900/20 blur-[120px] pointer-events-none transition-all duration-1000"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-emerald-100/30 to-teal-100/30 dark:from-emerald-900/20 dark:to-teal-900/20 blur-[120px] pointer-events-none transition-all duration-1000"></div>

      <div className="w-full max-w-[420px] p-8 sm:p-10 z-10 relative">
        <div className="w-full transition-all duration-500">
          
          <h2 className="text-center text-[28px] font-semibold tracking-tight text-neutral-900 dark:text-[#f5f5f7] mb-2 leading-tight font-['Inter',sans-serif]">
            Sign in to Helvica
          </h2>
          <p className="text-center text-[15px] text-neutral-500 dark:text-[#86868b] mb-10 font-medium">
            Manage your enterprise communications.
          </p>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3.5 bg-neutral-100/50 dark:bg-black/50 border border-neutral-200/60 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-[15px] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 backdrop-blur-md"
                  placeholder="Email or Apple ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3.5 bg-neutral-100/50 dark:bg-black/50 border border-neutral-200/60 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-[15px] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 backdrop-blur-md"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-[15px] font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 focus:outline-none focus:ring-4 focus:ring-neutral-900/20 dark:focus:ring-white/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-current"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
