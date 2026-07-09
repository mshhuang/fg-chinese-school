import React, { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Check current language from cookie
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1]) {
      const parts = match[1].split('/');
      if (parts.length > 2) {
         setCurrentLang(parts[2]);
      }
    }
  }, []);

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang);
    setIsOpen(false);

    if (lang === 'en') {
      // To go back to default language, clear the cookie and reload
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      window.location.reload();
      return;
    }

    // Try to use the native Google Translate select element directly
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    } else {
      // Fallback to cookie method
      document.cookie = `googtrans=/en/${lang}; path=/`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
      window.location.reload();
    }
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'zh-CN', label: '简体中文' }
  ];

  return (
    <div className="fixed bottom-24 right-6 z-[9999]">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-4 bg-surface-container-highest rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden min-w-[140px] flex flex-col pointer-events-auto origin-bottom-right animate-in fade-in zoom-in-95 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-4 py-3 text-sm font-label font-bold text-left hover:bg-surface-variant transition-colors flex items-center gap-3 ${currentLang === lang.code ? 'text-primary bg-primary/5' : 'text-on-surface'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-surface-container-highest text-on-surface-variant p-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 hover:text-on-surface transition-all flex items-center justify-center relative border border-outline-variant/30"
          title="Change Language"
        >
          <Languages className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
