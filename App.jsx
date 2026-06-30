import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCw, Activity, CalendarDays, User } from 'lucide-react';
import Auth from './components/Auth';
import CameraCapture from './components/CameraCapture';
import Dashboard from './components/Dashboard';
import MealHistory from './components/MealHistory';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all user data
  const fetchUserData = async (authToken) => {
    if (!authToken) return;
    setLoading(true);
    setError('');
    
    try {
      // 1. Fetch User Info
      const userRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (userRes.status === 401) {
        handleLogout();
        return;
      }
      const userData = await userRes.json();
      setUser(userData);

      // 2. Fetch Summary
      const summaryRes = await fetch('/api/analytics/summary', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // 3. Fetch Weekly Analytics
      const weeklyRes = await fetch('/api/analytics/weekly', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const weeklyData = await weeklyRes.json();
      setWeeklyData(weeklyData);

    } catch (err) {
      console.error(err);
      setError("Failed to sync nutritional dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData(token);
    }
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setSummary(null);
    setWeeklyData([]);
  };

  const handleUpdateGoals = async (goalsPayload) => {
    try {
      const response = await fetch('/api/auth/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goalsPayload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Goal update failed");
      
      setUser(data);
      // Sync dashboard totals
      fetchUserData(token);
    } catch (err) {
      setError("Could not update goals: " + err.message);
    }
  };

  const handleAddManualMeal = async (mealPayload) => {
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mealPayload)
      });
      if (!response.ok) throw new Error("Log meal failed");
      
      // Refresh user data to update totals
      fetchUserData(token);
    } catch (err) {
      setError("Failed to add meal: " + err.message);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Delete meal failed");
      
      // Refresh data
      fetchUserData(token);
    } catch (err) {
      setError("Failed to delete meal: " + err.message);
    }
  };

  const handleScanSuccess = (scanData) => {
    // A scanned item is immediately added to backend meal history
    // We just need to refresh our dashboard aggregates
    fetchUserData(token);
  };

  // If not authenticated, show Auth Page
  if (!token) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Loading spinner for initial state
  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080C14]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-neon-lime border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm font-medium">Syncing dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 pb-12 relative overflow-hidden">
      {/* Background Neon Spotlights */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-neon-lime opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-neon-orange opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>

      {/* STUNNING GLOWING HEADER */}
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥗</span>
            <span className="font-black text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              NutriScan <span className="text-neon-lime">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                <User size={12} className="text-neon-lime" />
                {user.email}
              </div>
            )}
            
            <button
              onClick={() => fetchUserData(token)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-neon-lime text-slate-400 hover:text-white transition-all"
              title="Sync dashboard logs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-bold text-red-400 bg-red-950/10 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={12} /> Log Out
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        {summary && (
          <div className="space-y-6">
            
            {/* Top row widget */}
            <Dashboard 
              summary={summary} 
              weeklyData={weeklyData} 
              onAddManualMeal={handleAddManualMeal}
              onUpdateGoals={handleUpdateGoals}
            />

            {/* Bottom logs + scanner layout split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Webcam scanner (7 cols) */}
              <div className="lg:col-span-7">
                <CameraCapture token={token} onScanSuccess={handleScanSuccess} />
              </div>

              {/* Right Column: Historical meal logs (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-neon-orange" />
                    Meal Intake History
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wide text-slate-500">
                    Limit 20 entries
                  </span>
                </div>
                <MealHistory meals={summary.meals} onDeleteMeal={handleDeleteMeal} />
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
