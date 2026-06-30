import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, Dumbbell, Shield } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    // Login form data is URL-encoded according to OAuth2 password flow, registration is JSON
    const headers = {};
    let body;

    if (isLogin) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams({
        username: email,
        password: password,
      });
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ email, password });
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        onLoginSuccess(data.access_token);
      } else {
        // Automatically switch to login on successful registration
        setIsLogin(true);
        setPassword('');
        setError('Account created! Please log in below.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080C14] px-4 relative overflow-hidden">
      {/* Decorative Neon Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-lime opacity-[0.05] blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-orange opacity-[0.05] blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 shadow-glass relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-br from-neon-orange to-neon-lime mb-3 shadow-neon-lime">
            <span className="text-2xl">🥗</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            NutriScan <span className="text-neon-lime">AI</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">AI-Powered Computer Vision Nutrition Tracker</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className={`p-3 rounded-lg border text-sm ${error.includes('created') ? 'border-neon-lime/30 bg-neon-lime/10 text-neon-lime' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                className="w-full bg-slate-900/60 border border-slate-700/60 focus:border-neon-lime focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                className="w-full bg-slate-900/60 border border-slate-700/60 focus:border-neon-lime focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-neon-orange to-neon-orange-hover hover:from-neon-lime hover:to-neon-lime-hover text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-neon-lime transition-all duration-300 transform active:scale-95 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : isLogin ? (
                <>
                  <LogIn size={18} /> Log In
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Sign Up
                </>
              )}
            </span>
          </button>
        </form>

        {/* Toggle link */}
        <div className="mt-6 text-center text-sm">
          <p className="text-slate-400">
            {isLogin ? "New to NutriScan?" : "Already have an account?"}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-neon-lime font-semibold hover:underline"
            >
              {isLogin ? 'Create Account' : 'Log In Instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
