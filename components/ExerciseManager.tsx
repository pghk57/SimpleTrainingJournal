
import React, { useState } from 'react';
import { MasterExercise, WorkoutTemplate, Exercise } from '../types';
import { translations, Language } from '../translations';

interface ExerciseManagerProps {
  masterExercises: MasterExercise[];
  templates: WorkoutTemplate[];
  onAdd: (ex: MasterExercise) => void;
  onUpdate: (ex: MasterExercise) => void;
  onDelete: (id: string) => void;
  onAddTemplate: (template: WorkoutTemplate) => void;
  onUpdateTemplate: (template: WorkoutTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  lang: Language;
}

export const ExerciseManager: React.FC<ExerciseManagerProps> = ({ 
  masterExercises, 
  templates, 
  onAdd, 
  onUpdate,
  onDelete, 
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate, 
  lang 
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'exercises' | 'templates'>('exercises');
  const [name, setName] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  const [editingEx, setEditingEx] = useState<MasterExercise | null>(null);
  const [editingTmpl, setEditingTmpl] = useState<WorkoutTemplate | null>(null);
  const [isCreatingNewTmpl, setIsCreatingNewTmpl] = useState(false);

  const muscleOptions = Object.keys(translations.en.muscles);

  const toggleMuscle = (muscle: string, isEditing: boolean = false) => {
    if (isEditing && editingEx) {
      const updatedMuscles = editingEx.defaultMuscles.includes(muscle)
        ? editingEx.defaultMuscles.filter(m => m !== muscle)
        : [...editingEx.defaultMuscles, muscle];
      setEditingEx({ ...editingEx, defaultMuscles: updatedMuscles });
    } else {
      if (selectedMuscles.includes(muscle)) {
        setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
      } else {
        setSelectedMuscles([...selectedMuscles, muscle]);
      }
    }
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      defaultMuscles: selectedMuscles
    });
    setName('');
    setSelectedMuscles([]);
  };

  const handleUpdateEx = () => {
    if (editingEx) {
      onUpdate(editingEx);
      setEditingEx(null);
    }
  };

  const handleUpdateTmpl = () => {
    if (editingTmpl) {
      if (isCreatingNewTmpl) {
        onAddTemplate(editingTmpl);
      } else {
        onUpdateTemplate(editingTmpl);
      }
      setEditingTmpl(null);
      setIsCreatingNewTmpl(false);
    }
  };

  const updateTmplExercise = (id: string, updates: Partial<Exercise>) => {
    if (editingTmpl) {
      const updatedEx = editingTmpl.exercises.map(ex => {
        if (ex.id === id) {
          const updated = { ...ex, ...updates };
          if (updated.repsPerSet && updates.sets !== undefined) {
            const newSetsCount = updates.sets;
            const currentRepsArray = [...(updated.repsPerSet || [])];
            if (newSetsCount > currentRepsArray.length) {
              const diff = newSetsCount - currentRepsArray.length;
              updated.repsPerSet = [...currentRepsArray, ...Array(diff).fill(updated.reps)];
            } else {
              updated.repsPerSet = currentRepsArray.slice(0, newSetsCount);
            }
          }
          return updated;
        }
        return ex;
      });
      setEditingTmpl({ ...editingTmpl, exercises: updatedEx });
    }
  };

  const handleExerciseNameChange = (id: string, name: string) => {
    if (!editingTmpl) return;
    const master = masterExercises.find(m => m.name === name);
    updateTmplExercise(id, { 
      name, 
      targetMuscles: master ? master.defaultMuscles : [] 
    });
  };

  const toggleTmplAdvancedMode = (exId: string) => {
    if (!editingTmpl) return;
    const updatedEx = editingTmpl.exercises.map(ex => {
      if (ex.id === exId) {
        if (ex.repsPerSet) {
          return { ...ex, repsPerSet: undefined };
        } else {
          const s = ex.sets > 0 ? ex.sets : 1;
          return { ...ex, sets: s, repsPerSet: Array(s).fill(ex.reps) };
        }
      }
      return ex;
    });
    setEditingTmpl({ ...editingTmpl, exercises: updatedEx });
  };

  const updateTmplIndividualRep = (exId: string, setIndex: number, newRep: number) => {
    if (!editingTmpl) return;
    const updatedEx = editingTmpl.exercises.map(ex => {
      if (ex.id === exId && ex.repsPerSet) {
        const newRepsPerSet = [...ex.repsPerSet];
        newRepsPerSet[setIndex] = newRep;
        return { ...ex, repsPerSet: newRepsPerSet };
      }
      return ex;
    });
    setEditingTmpl({ ...editingTmpl, exercises: updatedEx });
  };

  const addExerciseToTemplate = () => {
    if (editingTmpl) {
      const newEx: Exercise = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        reps: 0,
        sets: 0,
        targetMuscles: []
      };
      setEditingTmpl({ ...editingTmpl, exercises: [...editingTmpl.exercises, newEx] });
    }
  };

  const removeExerciseFromTemplate = (id: string) => {
    if (editingTmpl) {
      setEditingTmpl({
        ...editingTmpl,
        exercises: editingTmpl.exercises.filter(ex => ex.id !== id)
      });
    }
  };

  const handleCreateNewTemplate = () => {
    setIsCreatingNewTmpl(true);
    setEditingTmpl({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      exercises: []
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-full max-w-sm">
        <button 
          onClick={() => setActiveTab('exercises')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'exercises' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          {t.exercises}
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'templates' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          {t.templates}
        </button>
      </div>

      {activeTab === 'exercises' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t.addMasterExercise}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.exerciseName}</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.exerciseNamePlaceholder}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-slate-200 transition-all"
                  />
                </div>
                <button 
                  onClick={handleAdd}
                  disabled={!name.trim()}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50"
                >
                  {t.add}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.selectMuscles}</label>
                <div className="flex flex-wrap gap-2">
                  {muscleOptions.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMuscle(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        selectedMuscles.includes(m)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      {(t.muscles as any)[m] || m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{t.manageExercises}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {masterExercises.map((ex) => (
                <div key={ex.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{ex.name}</div>
                    <div className="flex gap-1 mt-1">
                      {ex.defaultMuscles.map(m => (
                        <span key={m} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {(t.muscles as any)[m] || m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingEx(ex)} className="text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors p-2"><i className="fa-solid fa-pen"></i></button>
                    <button onClick={() => onDelete(ex.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors p-2"><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-end">
            <button 
              onClick={handleCreateNewTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              {t.createTemplate}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{t.manageTemplates}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {templates.map((tmpl) => (
                <div key={tmpl.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{tmpl.name}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tmpl.exercises.map((ex, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 font-medium">
                          {ex.name} ({ex.sets}x{ex.reps})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingTmpl(tmpl); setIsCreatingNewTmpl(false); }} className="text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors p-2"><i className="fa-solid fa-pen"></i></button>
                    <button onClick={() => onDeleteTemplate(tmpl.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors p-2"><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editing Exercise Modal */}
      {editingEx && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.editMasterExercise}</h3>
              <button onClick={() => setEditingEx(null)} className="text-slate-400 hover:text-slate-600 p-2"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.exerciseName}</label>
                <input type="text" value={editingEx.name} onChange={(e) => setEditingEx({ ...editingEx, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.selectMuscles}</label>
                <div className="flex flex-wrap gap-2">
                  {muscleOptions.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMuscle(m, true)}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                        editingEx.defaultMuscles.includes(m)
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
                <button onClick={() => setEditingEx(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700">{t.cancel}</button>
                <button onClick={handleUpdateEx} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing/Creating Template Modal */}
      {editingTmpl && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {isCreatingNewTmpl ? t.createTemplate : t.editTemplate}
              </h3>
              <button onClick={() => setEditingTmpl(null)} className="text-slate-400 hover:text-slate-600 p-2"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-6 no-scrollbar">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.templateName}</label>
                <input 
                  type="text" 
                  value={editingTmpl.name} 
                  onChange={(e) => setEditingTmpl({ ...editingTmpl, name: e.target.value })} 
                  placeholder={t.templateNamePlaceholder}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-slate-200" 
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.exerciseList}</h4>
                  <button 
                    onClick={addExerciseToTemplate}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 rounded-lg"
                  >
                    <i className="fa-solid fa-plus mr-1"></i> {t.addExercise}
                  </button>
                </div>

                <div className="space-y-3">
                  {editingTmpl.exercises.map((ex) => (
                    <div key={ex.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <select 
                              value={ex.name}
                              onChange={(e) => handleExerciseNameChange(ex.id, e.target.value)}
                              className="flex-1 bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-none border-b border-slate-200 dark:border-slate-700 py-1"
                            >
                              <option value="" disabled>{t.selectExercise}</option>
                              {masterExercises.map(m => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => toggleTmplAdvancedMode(ex.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded ${ex.repsPerSet ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}
                            >
                              {ex.repsPerSet ? t.standard : t.advanced}
                            </button>
                          </div>
                          
                          <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">{t.sets}:</span>
                              <input 
                                type="number" 
                                value={ex.sets} 
                                onChange={(e) => updateTmplExercise(ex.id, { sets: parseInt(e.target.value) || 0 })} 
                                className="w-12 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs" 
                              />
                            </div>
                            {!ex.repsPerSet && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{t.reps}:</span>
                                <input 
                                  type="number" 
                                  value={ex.reps} 
                                  onChange={(e) => updateTmplExercise(ex.id, { reps: parseInt(e.target.value) || 0 })} 
                                  className="w-12 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs" 
                                />
                              </div>
                            )}
                          </div>

                          {ex.repsPerSet && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50">
                              {ex.repsPerSet.map((setRep, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                  <label className="text-[10px] text-slate-400 mb-1">{idx + 1}</label>
                                  <input 
                                    type="number"
                                    value={setRep}
                                    onChange={(e) => updateTmplIndividualRep(ex.id, idx, parseInt(e.target.value) || 0)}
                                    className="w-10 px-1 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-center"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => removeExerciseFromTemplate(ex.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-2"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {editingTmpl.exercises.length === 0 && (
                    <div className="text-center py-6 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-sm italic">
                      {t.noExercises}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={() => setEditingTmpl(null)} className="flex-1 py-3 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-bold">{t.cancel}</button>
              <button 
                onClick={handleUpdateTmpl} 
                disabled={!editingTmpl.name.trim() || editingTmpl.exercises.length === 0}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
