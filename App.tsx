
import React, { useState, useEffect } from 'react';
import { WorkoutSession, MasterExercise, WorkoutTemplate } from './types';
import { Calendar } from './components/Calendar';
import { Dashboard } from './components/Dashboard';
import { WorkoutForm } from './components/WorkoutForm';
import { ExerciseManager } from './components/ExerciseManager';
import { Settings, ThemeType } from './components/Settings';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [masterExercises, setMasterExercises] = useState<MasterExercise[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [view, setView] = useState<'calendar' | 'dashboard' | 'form' | 'exercises' | 'settings'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('training_journal_lang');
    return (saved as Language) || 'en';
  });

  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('training_journal_theme');
    return (saved as ThemeType) || 'system';
  });

  const t = translations[lang];

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (targetTheme: 'light' | 'dark') => {
      if (targetTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemDark ? 'dark' : 'light');
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Load from local storage
  useEffect(() => {
    const savedSessions = localStorage.getItem('training_journal_sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }

    const savedMaster = localStorage.getItem('training_journal_master_exercises');
    if (savedMaster) {
      try {
        setMasterExercises(JSON.parse(savedMaster));
      } catch (e) {
        console.error("Failed to load master exercises", e);
      }
    } else {
      const defaults: MasterExercise[] = [
        { id: '1', name: 'Push Up', defaultMuscles: ['Chest', 'Arms', 'Shoulders'] },
        { id: '2', name: 'Squat', defaultMuscles: ['Legs'] },
        { id: '3', name: 'Pull Up', defaultMuscles: ['Back', 'Arms'] },
      ];
      setMasterExercises(defaults);
    }

    const savedTemplates = localStorage.getItem('training_journal_templates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('training_journal_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('training_journal_master_exercises', JSON.stringify(masterExercises));
  }, [masterExercises]);

  useEffect(() => {
    localStorage.setItem('training_journal_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('training_journal_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('training_journal_theme', theme);
  }, [theme]);

  const handleSaveSession = (session: WorkoutSession) => {
    if (editingSession) {
      setSessions(sessions.map(s => s.id === session.id ? session : s));
    } else {
      setSessions([...sessions, session]);
    }
    setView('calendar');
    setSelectedDate(undefined);
    setEditingSession(null);
  };

  const deleteSession = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  const handleEditClick = (session: WorkoutSession) => {
    setEditingSession(session);
    setView('form');
  };

  const handleAddMasterExercise = (ex: MasterExercise) => {
    setMasterExercises([...masterExercises, ex]);
  };

  const handleUpdateMasterExercise = (ex: MasterExercise) => {
    setMasterExercises(masterExercises.map(m => m.id === ex.id ? ex : m));
  };

  const handleDeleteMasterExercise = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      setMasterExercises(masterExercises.filter(ex => ex.id !== id));
    }
  };

  const handleSaveTemplate = (template: WorkoutTemplate) => {
    setTemplates([...templates, template]);
  };

  const handleUpdateTemplate = (template: WorkoutTemplate) => {
    setTemplates(templates.map(t => t.id === template.id ? template : t));
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const NavButton = ({ target, icon, label }: { target: typeof view, icon: string, label: string }) => (
    <button 
      onClick={() => { setView(target); setEditingSession(null); }}
      className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${view === target ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
    >
      <i className={`fa-solid ${icon} text-lg`}></i>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 font-sans transition-colors duration-300">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === 'calendar' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <Calendar 
              sessions={sessions} 
              lang={lang}
              onSelectDate={(date) => setSelectedDate(date)} 
            />
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                {selectedDate ? `${t.workoutsFor} ${selectedDate}` : t.recentLogs}
              </h3>
              <div className="space-y-4">
                {(selectedDate ? sessions.filter(s => s.date === selectedDate) : sessions.slice().reverse().slice(0, 5)).map(session => (
                  <div key={session.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider">{session.title || t.workout}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{session.date} • {session.time}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {session.exercises.map(ex => (
                          <span key={ex.id} className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded text-slate-700 dark:text-slate-200 font-medium">
                            {ex.name} <span className="text-slate-400 dark:text-slate-500">({ex.sets}x{ex.reps})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <button 
                        onClick={() => handleEditClick(session)}
                        className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 p-2 transition-colors"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button 
                        onClick={() => deleteSession(session.id)}
                        className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-600 whitespace-pre-line">
                    <i className="fa-solid fa-clipboard-list text-4xl mb-4 block opacity-20"></i>
                    {t.emptyJournal}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'dashboard' && <Dashboard sessions={sessions} lang={lang} />}

        {view === 'exercises' && (
          <ExerciseManager 
            masterExercises={masterExercises} 
            templates={templates}
            onAdd={handleAddMasterExercise} 
            onUpdate={handleUpdateMasterExercise}
            onDelete={handleDeleteMasterExercise} 
            onAddTemplate={handleSaveTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            lang={lang} 
          />
        )}

        {view === 'settings' && (
          <Settings 
            lang={lang} 
            onLangChange={setLang}
            theme={theme} 
            onThemeChange={setTheme} 
          />
        )}

        {view === 'form' && (
          <WorkoutForm 
            initialDate={selectedDate}
            initialSession={editingSession}
            onSave={handleSaveSession} 
            onCancel={() => { setView('calendar'); setEditingSession(null); }} 
            lang={lang}
            masterExercises={masterExercises}
            templates={templates}
            onAddMasterExercise={handleAddMasterExercise}
            onSaveTemplate={handleSaveTemplate}
          />
        )}
      </main>

      {view !== 'form' && (
        <button 
          onClick={() => { setEditingSession(null); setView('form'); }}
          className="fixed bottom-24 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-300 dark:shadow-none flex items-center justify-center hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all z-20"
        >
          <i className="fa-solid fa-plus text-2xl"></i>
        </button>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 h-16 z-40 transition-colors duration-300">
        <div className="flex h-full max-w-2xl mx-auto">
          <NavButton target="calendar" icon="fa-calendar-days" label={t.calendar} />
          <NavButton target="dashboard" icon="fa-chart-pie" label={t.analytics} />
          <NavButton target="exercises" icon="fa-list-check" label={t.exercises} />
          <NavButton target="settings" icon="fa-gear" label={t.settings} />
        </div>
      </nav>
    </div>
  );
};

export default App;
