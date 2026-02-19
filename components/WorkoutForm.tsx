
import React, { useState } from 'react';
import { Exercise, WorkoutSession, MasterExercise, WorkoutTemplate } from '../types';
import { translations, Language } from '../translations';

interface WorkoutFormProps {
  onSave: (session: WorkoutSession) => void;
  onCancel: () => void;
  initialDate?: string;
  initialSession?: WorkoutSession | null;
  lang: Language;
  masterExercises: MasterExercise[];
  templates: WorkoutTemplate[];
  onAddMasterExercise: (ex: MasterExercise) => void;
  onSaveTemplate: (template: WorkoutTemplate) => void;
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ 
  onSave, 
  onCancel, 
  initialDate, 
  initialSession,
  lang, 
  masterExercises, 
  templates,
  onAddMasterExercise,
  onSaveTemplate
}) => {
  const t = translations[lang];
  const [title, setTitle] = useState(initialSession?.title || '');
  const [exercises, setExercises] = useState<Exercise[]>(initialSession?.exercises || []);
  const [date, setDate] = useState(initialSession?.date || initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialSession?.time || new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Modals state
  const [showExModal, setShowExModal] = useState(false);
  const [showTmplModal, setShowTmplModal] = useState(false);
  const [activeExId, setActiveExId] = useState<string | null>(null);
  
  // New Master Ex state
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterMuscles, setNewMasterMuscles] = useState<string[]>([]);
  
  // New Template state
  const [newTmplName, setNewTmplName] = useState('');

  const addManualExercise = () => {
    setExercises([...exercises, {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      reps: 0,
      sets: 0,
      targetMuscles: []
    }]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(exercises.map(ex => {
      if (ex.id === id) {
        const updatedEx = { ...ex, ...updates };
        
        // Handle sync between sets count and repsPerSet array
        if (updatedEx.repsPerSet && updates.sets !== undefined) {
          const newSetsCount = updates.sets;
          const currentRepsArray = [...(updatedEx.repsPerSet || [])];
          
          if (newSetsCount > currentRepsArray.length) {
            // Add elements initialized with standard reps
            const diff = newSetsCount - currentRepsArray.length;
            updatedEx.repsPerSet = [...currentRepsArray, ...Array(diff).fill(updatedEx.reps)];
          } else {
            // Trim elements
            updatedEx.repsPerSet = currentRepsArray.slice(0, newSetsCount);
          }
        }
        
        return updatedEx;
      }
      return ex;
    }));
  };

  const toggleAdvancedMode = (exId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        if (ex.repsPerSet) {
          // Switch to standard mode
          return { ...ex, repsPerSet: undefined };
        } else {
          // Switch to advanced mode
          // Ensure we have at least one set if sets is 0 to initialize the array
          const initialSets = ex.sets > 0 ? ex.sets : 1;
          return { ...ex, sets: initialSets, repsPerSet: Array(initialSets).fill(ex.reps) };
        }
      }
      return ex;
    }));
  };

  const updateIndividualRep = (exId: string, setIndex: number, newRep: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId && ex.repsPerSet) {
        const newRepsPerSet = [...ex.repsPerSet];
        newRepsPerSet[setIndex] = newRep;
        return { ...ex, repsPerSet: newRepsPerSet };
      }
      return ex;
    }));
  };

  const handleExerciseNameChange = (id: string, name: string) => {
    if (name === "ADD_NEW") {
      setActiveExId(id);
      setShowExModal(true);
      return;
    }
    const master = masterExercises.find(m => m.name === name);
    updateExercise(id, { 
      name, 
      targetMuscles: master ? master.defaultMuscles : [] 
    });
  };

  const applyTemplate = (tmplId: string) => {
    const tmpl = templates.find(t => t.id === tmplId);
    if (tmpl) {
      const clonedExercises = tmpl.exercises.map(ex => ({
        ...ex,
        id: Math.random().toString(36).substr(2, 9)
      }));
      setExercises([...exercises, ...clonedExercises]);
      if (!title) setTitle(tmpl.name);
    }
  };

  const handleSaveMaster = () => {
    if (!newMasterName.trim() || !activeExId) return;
    const newMaster: MasterExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMasterName.trim(),
      defaultMuscles: newMasterMuscles
    };
    onAddMasterExercise(newMaster);
    updateExercise(activeExId, { name: newMaster.name, targetMuscles: newMaster.defaultMuscles });
    setNewMasterName('');
    setNewMasterMuscles([]);
    setShowExModal(false);
    setActiveExId(null);
  };

  const handleSaveTmpl = () => {
    if (!newTmplName.trim() || exercises.length === 0) return;
    onSaveTemplate({
      id: Math.random().toString(36).substr(2, 9),
      name: newTmplName.trim(),
      exercises: exercises.map(ex => ({ ...ex, id: Math.random().toString(36).substr(2, 9) }))
    });
    setNewTmplName('');
    setShowTmplModal(false);
    // Visual feedback is inherent as modal closes
  };

  const validate = (): boolean => {
    if (exercises.length === 0) return false;
    
    return exercises.every(ex => {
      const nameValid = ex.name.trim() !== '';
      const setsValid = ex.sets > 0;
      let repsValid = true;
      
      if (ex.repsPerSet) {
        repsValid = ex.repsPerSet.every(r => r > 0);
      } else {
        repsValid = ex.reps > 0;
      }
      
      return nameValid && setsValid && repsValid;
    });
  };

  const handleSave = () => {
    setAttemptedSubmit(true);
    if (!validate()) return;
    
    onSave({
      id: initialSession?.id || Math.random().toString(36).substr(2, 9),
      title: title || t.workout,
      date,
      time,
      exercises
    });
  };

  const muscleOptions = Object.keys(translations.en.muscles);
  const toggleMuscle = (muscle: string) => {
    if (newMasterMuscles.includes(muscle)) {
      setNewMasterMuscles(newMasterMuscles.filter(m => m !== muscle));
    } else {
      setNewMasterMuscles([...newMasterMuscles, muscle]);
    }
  };

  const getErrorClass = (isInvalid: boolean) => {
    return isInvalid ? 'border-red-500 ring-1 ring-red-500 bg-red-50 dark:bg-red-950/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="relative">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto transition-colors duration-300">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {initialSession ? t.editTraining : t.recordTraining}
          </h2>
          {templates.length > 0 && (
            <div className="flex flex-col items-end">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t.applyTemplate}</label>
              <select 
                onChange={(e) => applyTemplate(e.target.value)}
                defaultValue=""
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-600 dark:text-slate-300 appearance-none pr-8 relative transition-colors"
                style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px'}}
              >
                <option value="" disabled>{t.applyTemplate}</option>
                {templates.map(tmpl => (
                  <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.sessionName}</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.placeholderSession}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.date}</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.time}</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t.exerciseList}</h3>
              <button 
                onClick={addManualExercise}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                {t.addExercise}
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((ex) => {
                const isNameInvalid = attemptedSubmit && ex.name === '';
                const isSetsInvalid = attemptedSubmit && ex.sets <= 0;
                const isRepsInvalid = attemptedSubmit && !ex.repsPerSet && ex.reps <= 0;

                return (
                  <div key={ex.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 group transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <select 
                            value={ex.name}
                            onChange={(e) => handleExerciseNameChange(ex.id, e.target.value)}
                            className={`flex-1 bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-none border-b focus:border-blue-400 py-1 transition-colors ${isNameInvalid ? 'border-red-500 text-red-600' : 'border-slate-200 dark:border-slate-700'}`}
                          >
                            <option value="" disabled>{t.selectExercise}</option>
                            {masterExercises.map(m => (
                              <option key={m.id} value={m.name}>{m.name}</option>
                            ))}
                            <option value="ADD_NEW" className="text-blue-600 dark:text-blue-400 font-bold">{t.addNew}</option>
                          </select>
                          <button
                            onClick={() => toggleAdvancedMode(ex.id)}
                            className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${ex.repsPerSet ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                          >
                            {ex.repsPerSet ? t.standard : t.advanced}
                          </button>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="flex gap-6 items-center">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${isSetsInvalid ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>{t.sets}:</span>
                              <input 
                                type="number"
                                min="0"
                                value={ex.sets}
                                onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) || 0 })}
                                className={`w-16 px-2 py-1 border rounded text-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-400 dark:text-slate-100 ${getErrorClass(isSetsInvalid)}`}
                              />
                            </div>
                            {!ex.repsPerSet && (
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${isRepsInvalid ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>{t.reps}:</span>
                                <input 
                                  type="number"
                                  min="0"
                                  value={ex.reps}
                                  onChange={(e) => updateExercise(ex.id, { reps: parseInt(e.target.value) || 0 })}
                                  className={`w-16 px-2 py-1 border rounded text-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-400 dark:text-slate-100 ${getErrorClass(isRepsInvalid)}`}
                                />
                              </div>
                            )}
                          </div>

                          {ex.repsPerSet && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                              {ex.repsPerSet.map((setRep, idx) => {
                                const isIndividualRepInvalid = attemptedSubmit && setRep <= 0;
                                return (
                                  <div key={idx} className="flex flex-col items-center">
                                    <label className={`text-[10px] font-medium mb-1 ${isIndividualRepInvalid ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>{t.set} {idx + 1}</label>
                                    <input 
                                      type="number"
                                      min="0"
                                      value={setRep}
                                      onChange={(e) => updateIndividualRep(ex.id, idx, parseInt(e.target.value) || 0)}
                                      className={`w-12 px-2 py-1 border rounded text-xs text-center outline-none focus:ring-1 focus:ring-blue-400 transition-all dark:text-slate-100 ${getErrorClass(isIndividualRepInvalid)}`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeExercise(ex.id)}
                        className="text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
              {exercises.length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                  {t.noExercises}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-3">
              <button 
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleSave}
                className="flex-2 px-12 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
              >
                {initialSession ? t.updateSession : t.saveSession}
              </button>
            </div>
            {exercises.length > 0 && !initialSession && (
              <button 
                onClick={() => setShowTmplModal(true)}
                className="w-full py-2 text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                <i className="fa-solid fa-bookmark mr-2"></i> {t.saveAsTemplate}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pop-up Modal for Master Exercise */}
      {showExModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.addMasterExercise}</h3>
              <button onClick={() => setShowExModal(false)} className="text-slate-400 hover:text-slate-600 p-2"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.exerciseName}</label>
                <input 
                  type="text" 
                  autoFocus 
                  value={newMasterName} 
                  onChange={(e) => setNewMasterName(e.target.value)} 
                  placeholder={t.exerciseNamePlaceholder} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-slate-100" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.selectMuscles}</label>
                <div className="flex flex-wrap gap-2">
                  {muscleOptions.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMuscle(m)}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                        newMasterMuscles.includes(m)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {(t.muscles as any)[m] || m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowExModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold">{t.cancel}</button>
                <button onClick={handleSaveMaster} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">{t.saveAndAdd}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Modal for Save Template */}
      {showTmplModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.saveAsTemplate}</h3>
              <button onClick={() => setShowTmplModal(false)} className="text-slate-400 hover:text-slate-600 p-2"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.templateName}</label>
                <input 
                  type="text" 
                  autoFocus 
                  value={newTmplName} 
                  onChange={(e) => setNewTmplName(e.target.value)} 
                  placeholder={t.templateNamePlaceholder} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-slate-100" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowTmplModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold">{t.cancel}</button>
                <button onClick={handleSaveTmpl} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
