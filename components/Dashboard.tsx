
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { WorkoutSession } from '../types';
import { translations, Language } from '../translations';

interface DashboardProps {
  sessions: WorkoutSession[];
  lang: Language;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

type PeriodType = 'all' | '7d' | '30d' | 'month' | 'year';

export const Dashboard: React.FC<DashboardProps> = ({ sessions, lang }) => {
  const t = translations[lang];
  const [period, setPeriod] = useState<PeriodType>('all');

  const filterSessionsByPeriod = (data: WorkoutSession[], selectedPeriod: PeriodType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return data.filter(s => {
      const sessionDate = new Date(s.date);
      if (selectedPeriod === 'all') return true;
      if (selectedPeriod === '7d') {
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        return sessionDate >= start;
      }
      if (selectedPeriod === '30d') {
        const start = new Date(today);
        start.setDate(today.getDate() - 30);
        return sessionDate >= start;
      }
      if (selectedPeriod === 'month') {
        return sessionDate.getMonth() === today.getMonth() && sessionDate.getFullYear() === today.getFullYear();
      }
      if (selectedPeriod === 'year') {
        return sessionDate.getFullYear() === today.getFullYear();
      }
      return true;
    });
  };

  const filteredSessions = useMemo(() => filterSessionsByPeriod(sessions, period), [sessions, period]);

  const summaryStats = useMemo(() => {
    let totalReps = 0;
    let totalSets = 0;

    filteredSessions.forEach(session => {
      session.exercises.forEach(ex => {
        const repsCount = ex.repsPerSet 
          ? ex.repsPerSet.reduce((sum, r) => sum + r, 0)
          : (ex.reps * ex.sets);
          
        totalReps += repsCount;
        totalSets += ex.sets;
      });
    });

    return {
      totalReps,
      totalSets,
      totalWorkouts: filteredSessions.length
    };
  }, [filteredSessions]);

  const muscleDistribution = useMemo(() => {
    const muscleMap: Record<string, number> = {};

    filteredSessions.forEach(session => {
      session.exercises.forEach(ex => {
        const repsCount = ex.repsPerSet 
          ? ex.repsPerSet.reduce((sum, r) => sum + r, 0)
          : (ex.reps * ex.sets);
        
        ex.targetMuscles.forEach(muscle => {
          const translatedName = (t.muscles as any)[muscle] || muscle;
          muscleMap[translatedName] = (muscleMap[translatedName] || 0) + repsCount;
        });
      });
    });

    return Object.entries(muscleMap).map(([name, value]) => ({ name, value }));
  }, [filteredSessions, t]);

  const PeriodSelector = () => (
    <div className="flex items-center gap-2">
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.period}:</label>
      <select 
        value={period}
        onChange={(e) => setPeriod(e.target.value as PeriodType)}
        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none pr-6 relative transition-colors"
        style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '10px'}}
      >
        <option value="all">{t.allTime}</option>
        <option value="7d">{t.last7Days}</option>
        <option value="30d">{t.last30Days}</option>
        <option value="month">{t.thisMonth}</option>
        <option value="year">{t.thisYear}</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center mb-2">
        <PeriodSelector />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center transition-colors">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{t.totalReps}</span>
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{summaryStats.totalReps.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center transition-colors">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{t.totalSets}</span>
          <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{summaryStats.totalSets.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center transition-colors">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{t.workouts}</span>
          <span className="text-4xl font-bold text-amber-600 dark:text-amber-400 mt-2">{summaryStats.totalWorkouts}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t.muscleFocus}</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={muscleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {muscleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">{t.activity7Days}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessions.slice(-7).map(s => ({ 
                name: s.date.slice(5), 
                volume: s.exercises.reduce((acc, ex) => {
                  const repsCount = ex.repsPerSet 
                    ? ex.repsPerSet.reduce((sum, r) => sum + r, 0)
                    : (ex.reps * ex.sets);
                  return acc + repsCount;
                }, 0) 
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#1e293b', opacity: 0.1}} 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
