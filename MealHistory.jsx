import React from 'react';
import { Trash2, Calendar, ShieldCheck } from 'lucide-react';

export default function MealHistory({ meals, onDeleteMeal }) {
  if (!meals || meals.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-slate-500 border border-white/5">
        <span className="text-3xl block mb-2">🍽️</span>
        <p className="text-sm">No food logs registered yet today.</p>
        <p className="text-xs text-slate-600 mt-1">Scan a meal above to see history.</p>
      </div>
    );
  }

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <div 
          key={meal.id} 
          className="glass-card rounded-xl p-4 border border-white/5 flex gap-4 items-center justify-between group hover:border-white/10 transition-all"
        >
          {/* Meal Details */}
          <div className="flex gap-4 items-center min-w-0">
            {meal.image_path ? (
              <img 
                src={meal.image_path} 
                alt={meal.food_name} 
                className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-slate-900 flex items-center justify-center text-xl border border-slate-800 shrink-0">
                🍳
              </div>
            )}
            
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm truncate">{meal.food_name}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400 mt-1 items-center">
                <span className="text-neon-orange font-semibold">{Math.round(meal.calories)} kcal</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {formatTime(meal.created_at)}
                </span>
                {meal.confidence < 1.0 && (
                  <>
                    <span>•</span>
                    <span className="text-neon-cyan flex items-center gap-0.5">
                      <ShieldCheck size={12} /> AI Verified ({Math.round(meal.confidence * 100)}%)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Macro Breakdown + Delete */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-3 text-right">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Prot</p>
                <p className="text-xs font-semibold text-neon-lime">{Math.round(meal.protein)}g</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Carb</p>
                <p className="text-xs font-semibold text-slate-300">{Math.round(meal.carbs)}g</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Fat</p>
                <p className="text-xs font-semibold text-slate-300">{Math.round(meal.fat)}g</p>
              </div>
            </div>

            <button
              onClick={() => onDeleteMeal(meal.id)}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
              title="Delete meal log"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
