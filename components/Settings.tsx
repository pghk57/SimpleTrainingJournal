
import React, { useState } from 'react';
import { translations, Language } from '../translations';

// --- CONFIGURATION ---
// Set your email address here (e.g., 'yourname@example.com')
const DEVELOPER_EMAIL = 'simpletrainingjournal@gmail.com'; 
// ---------------------

export type ThemeType = 'light' | 'dark' | 'system';

interface SettingsProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const Settings: React.FC<SettingsProps> = ({ lang, onLangChange, theme, onThemeChange }) => {
  const t = translations[lang];
  const [feedbackSubject, setFeedbackSubject] = useState<'bug' | 'feature' | 'other'>('bug');
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSendFeedback = () => {
    if (!feedbackDetails.trim()) return;
    
    const subjectLabel = feedbackSubject === 'bug' ? t.bugReport : feedbackSubject === 'feature' ? t.featureRequest : t.other;
    const emailBody = `Subject: ${subjectLabel}\n\nDetails:\n${feedbackDetails}`;

    if (DEVELOPER_EMAIL) {
      const mailtoLink = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent('Simple Training Journal Feedback: ' + subjectLabel)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
    } else {
      console.log(`[Feedback]
      To: ${DEVELOPER_EMAIL || 'NOT_CONFIGURED'}
      Subject: ${subjectLabel}
      Details: ${feedbackDetails}`);
    }
    
    setFeedbackDetails('');
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-16">
      {/* Language Section */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-globe text-indigo-500"></i>
          {t.language}
        </h2>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => onLangChange('en')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
              lang === 'en' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLangChange('ja')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
              lang === 'ja' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            日本語
          </button>
        </div>
      </section>

      {/* Theme Section */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-palette text-blue-500"></i>
          {t.theme}
        </h2>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(['light', 'dark', 'system'] as ThemeType[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onThemeChange(mode)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                theme === mode 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {mode === 'light' ? t.light : mode === 'dark' ? t.dark : t.system}
            </button>
          ))}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-comment-dots text-emerald-500"></i>
          {t.feedback}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.subject}</label>
            <select
              value={feedbackSubject}
              onChange={(e) => setFeedbackSubject(e.target.value as any)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-slate-200"
            >
              <option value="bug">{t.bugReport}</option>
              <option value="feature">{t.featureRequest}</option>
              <option value="other">{t.other}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.details}</label>
            <textarea
              value={feedbackDetails}
              onChange={(e) => setFeedbackDetails(e.target.value)}
              placeholder={t.feedbackPlaceholder}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none dark:text-slate-200"
            />
          </div>
          
          <button
            onClick={handleSendFeedback}
            disabled={!feedbackDetails.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSent ? (
              <>
                <i className="fa-solid fa-check"></i>
                {t.feedbackSuccess}
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane"></i>
                {t.sendFeedback}
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
