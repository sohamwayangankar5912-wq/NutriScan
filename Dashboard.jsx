import React, { useState } from 'react';
import { Target, Plus, Flame, Settings, Info, Dumbbell } from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';

export default function Dashboard({ summary, weeklyData, onAddManualMeal, onUpdateGoals }) {
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  
  // Goal form states
  const [calGoal, setCalGoal] = useState(summary.calorie_goal);
  const [protGoal, setProtGoal] = useState(summary.protein_goal);
  const [carbGoal, setCarbGoal] = useState(summary.carb_goal);
  const [fatGoal, setFatGoal] = useState(summary.fat_goal);

  // Manual meal form states
  const [manualName, setManualName] = useState('');
  const [manualCal, setManualCal] = useState('');
  const [manualProt, setManualProt] = useState('');
  const [manualCarb, setManualCarb] = useState('');
  const [manualFat, setManualFat] = useState('');

  // Calculate percentages
  const calPercent = Math.min(100, Math.round((summary.calorie_consumed / summary.calorie_goal) * 100)) || 0;
  const protPercent = Math.min(100, Math.round((summary.protein_consumed / summary.protein_goal) * 100)) || 0;
  const carbPercent = Math.min(100, Math.round((summary.carb_consumed / summary.carb_goal) * 100)) || 0;
  const fatPercent = Math.min(100, Math.round((summary.fat_consumed / summary.fat_goal) * 100)) || 0;

  // SVG ring parameters
  const size = 200;
  const strokeWidth = 12;
  const center = size / 2;
  
  // Outer ring (Calories)
  const outerRadius = center - strokeWidth - 5;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerStrokeDashoffset = outerCircumference - (calPercent / 100) * outerCircumference;

  // Inner ring (Protein)
  const innerRadius = outerRadius - strokeWidth - 10;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerStrokeDashoffset = innerCircumference - (protPercent / 100) * innerCircumference;

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    onUpdateGoals({
      calorie_goal: parseInt(calGoal),
      protein_goal: parseInt(protGoal),
      carb_goal: parseInt(carbGoal),
      fat_goal: parseInt(fatGoal)
    });
    setShowGoalsModal(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualName || !manualCal) return;
    onAddManualMeal({
      food_name: manualName,
      calories: parseFloat(manualCal),
      protein: parseFloat(manualProt || 0),
      carbs: parseFloat(manualCarb || 0),
      fat: parseFloat(manualFat || 0),
      confidence: 1.0
    });
    setManualName('');
    setManualCal('');
    setManualProt('');
    setManualCarb('');
    setManualFat('');
    setShowAddManual(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GAMIFIED NEON CONCENTRIC PROGRESS RING */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center relative border border-white/5 min-h-[300px]">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Flame size={14} className="text-neon-orange animate-pulse" />
            Today's Target
          </div>
          <button 
            onClick={() => setShowGoalsModal(true)} 
            className="absolute top-4 right-4 text-slate-500 hover:text-neon-lime transition-colors"
            title="Edit nutritional goals"
          >
            <Settings size={16} />
          </button>

          {/* SVG Concentric Ring */}
          <div className="relative mt-4" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Outer Track */}
              <circle
                cx={center}
                cy={center}
                r={outerRadius}
                fill="transparent"
                stroke="rgba(255, 94, 58, 0.08)"
                strokeWidth={strokeWidth}
              />
              {/* Outer Progress (Calories) */}
              <circle
                cx={center}
                cy={center}
                r={outerRadius}
                fill="transparent"
                stroke="#FF5E3A"
                strokeWidth={strokeWidth}
                strokeDasharray={outerCircumference}
                strokeDashoffset={outerStrokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(255, 94, 58, 0.45))'
                }}
              />

              {/* Inner Track */}
              <circle
                cx={center}
                cy={center}
                r={innerRadius}
                fill="transparent"
                stroke="rgba(204, 255, 0, 0.08)"
                strokeWidth={strokeWidth}
              />
              {/* Inner Progress (Protein) */}
              <circle
                cx={center}
                cy={center}
                r={innerRadius}
                fill="transparent"
                stroke="#CCFF00"
                strokeWidth={strokeWidth}
                strokeDasharray={innerCircumference}
                strokeDashoffset={innerStrokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(204, 255, 0, 0.45))'
                }}
              />
            </svg>

            {/* Inner Dashboard Core Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">Calories</span>
              <span className="text-3xl font-black text-white leading-none my-1">
                {Math.round(summary.calorie_consumed)}
              </span>
              <span className="text-xs text-slate-400">
                / {summary.calorie_goal} kcal
              </span>
              <div className="mt-2 text-[10px] uppercase font-bold text-neon-lime bg-neon-lime/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Dumbbell size={10} /> Pro: {Math.round(summary.protein_consumed)}g
              </div>
            </div>
          </div>

          <div className="w-full flex gap-4 justify-around mt-6 pt-4 border-t border-white/5 text-center text-xs">
            <div>
              <p className="text-slate-500">Calorie Goal</p>
              <p className="font-extrabold text-neon-orange mt-0.5">{calPercent}%</p>
            </div>
            <div className="border-l border-white/5 h-6"></div>
            <div>
              <p className="text-slate-500">Protein Goal</p>
              <p className="font-extrabold text-neon-lime mt-0.5">{protPercent}%</p>
            </div>
          </div>
        </div>

        {/* STATS PANELS (CARBS & FATS) */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/5 min-h-[300px]">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Target size={14} className="text-neon-cyan" />
            Macronutrients
          </div>

          <div className="space-y-6 my-auto">
            {/* Protein summary bar */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-slate-200">Protein (g)</span>
                <span className="text-xs text-slate-400">
                  <span className="text-neon-lime font-bold">{Math.round(summary.protein_consumed)}</span> / {summary.protein_goal}g
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-neon-lime h-full rounded-full transition-all duration-700" 
                  style={{ width: `${protPercent}%`, boxShadow: '0 0 10px rgba(204, 255, 0, 0.4)' }}
                ></div>
              </div>
            </div>

            {/* Carbs progress */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-slate-200">Carbohydrates (g)</span>
                <span className="text-xs text-slate-400">
                  <span className="text-neon-cyan font-bold">{Math.round(summary.carb_consumed)}</span> / {summary.carb_goal}g
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-neon-cyan h-full rounded-full transition-all duration-700" 
                  style={{ width: `${carbPercent}%`, boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)' }}
                ></div>
              </div>
            </div>

            {/* Fat progress */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-slate-200">Fats (g)</span>
                <span className="text-xs text-slate-400">
                  <span className="text-neon-orange font-bold">{Math.round(summary.fat_consumed)}</span> / {summary.fat_goal}g
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-neon-orange h-full rounded-full transition-all duration-700" 
                  style={{ width: `${fatPercent}%`, boxShadow: '0 0 10px rgba(255, 94, 58, 0.4)' }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddManual(!showAddManual)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-xs font-bold tracking-wide text-white transition-colors"
          >
            <Plus size={14} /> Log Meal Manually
          </button>
        </div>

        {/* WEEKLY ANALYTICS SUMMARY */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 min-h-[300px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white mb-1">Weekly Trends</h3>
            <p className="text-xs text-slate-400 mb-4">Past 7 days calorie & protein aggregate</p>
          </div>
          <div className="my-auto">
            <AnalyticsChart weeklyData={weeklyData} />
          </div>
        </div>

      </div>

      {/* MANUAL LOGGING TOGGLE SECTION */}
      {showAddManual && (
        <div className="glass-card rounded-2xl p-6 border border-neon-lime/20 animate-fadeIn">
          <h3 className="text-base font-bold text-white mb-4">Quick Manual Log</h3>
          <form onSubmit={handleManualSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Food Item Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-800 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-xs"
                placeholder="e.g. Scrambled Eggs"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Calories (kcal)</label>
              <input
                type="number"
                required
                className="w-full bg-slate-900 border border-slate-800 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-xs"
                placeholder="0"
                value={manualCal}
                onChange={e => setManualCal(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Protein (g)</label>
              <input
                type="number"
                className="w-full bg-slate-900 border border-slate-800 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-xs"
                placeholder="0"
                value={manualProt}
                onChange={e => setManualProt(e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1 flex gap-2 pt-5">
              <button
                type="submit"
                className="flex-1 bg-neon-lime text-slate-950 font-bold py-2 px-3 rounded-xl hover:shadow-neon-lime transition-all text-xs"
              >
                Log Meal
              </button>
              <button
                type="button"
                onClick={() => setShowAddManual(false)}
                className="px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT GOALS DIALOG (MODAL) */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card border border-white/10 rounded-2xl p-6 shadow-glass relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target size={18} className="text-neon-lime" /> Set Daily Goals
            </h3>
            
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Daily Calorie Target (kcal)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-900 border border-slate-700/60 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-sm"
                  value={calGoal}
                  onChange={e => setCalGoal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Protein Goal (g)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-900 border border-slate-700/60 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-sm"
                  value={protGoal}
                  onChange={e => setProtGoal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Carb Goal (g)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-900 border border-slate-700/60 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-sm"
                  value={carbGoal}
                  onChange={e => setCarbGoal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Fat Goal (g)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-900 border border-slate-700/60 focus:border-neon-lime focus:outline-none rounded-xl py-2 px-3 text-sm"
                  value={fatGoal}
                  onChange={e => setFatGoal(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-neon-orange to-neon-orange-hover text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-all"
                >
                  Save Goals
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoalsModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
