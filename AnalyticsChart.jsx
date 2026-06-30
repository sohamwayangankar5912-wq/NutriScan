import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsChart({ weeklyData }) {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No weekly log data available yet.
      </div>
    );
  }

  // Custom styling for tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl backdrop-blur-md shadow-xl">
          <p className="text-xs font-bold text-slate-400 mb-2">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} className="text-sm font-semibold flex justify-between gap-4" style={{ color: item.color }}>
              <span>{item.name}:</span>
              <span>{Math.round(item.value)} {item.name === 'Calories' ? 'kcal' : 'g'}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={weeklyData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF5E3A" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#FF5E3A" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#CCFF00" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="day" 
            stroke="#64748B" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748B" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            name="Calories"
            type="monotone" 
            dataKey="calories" 
            stroke="#FF5E3A" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCalories)" 
          />
          <Area 
            name="Protein"
            type="monotone" 
            dataKey="protein" 
            stroke="#CCFF00" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorProtein)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
