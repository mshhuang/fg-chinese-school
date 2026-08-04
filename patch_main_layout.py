import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

# Add import for i18n
if 'useLanguage' not in content:
    content = content.replace(
        'import { cn } from "../../lib/utils";',
        'import { cn } from "../../lib/utils";\nimport { useLanguage } from "../../lib/i18n";\nimport { Globe } from "lucide-react";'
    )

# Get the useLanguage hook
if 'const { t, language, setLanguage } = useLanguage();' not in content:
    content = content.replace(
        'const location = useLocation();',
        'const location = useLocation();\n  const { t, language, setLanguage } = useLanguage();'
    )

# Desktop nav translation
if '{item.label}' in content:
    content = content.replace('{item.label}', '{t(item.label)}')

# Add language switcher for desktop (around line 493)
old_logout_desktop = """            <div className="mt-2">
               <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 rounded-full text-error hover:bg-error-container/20 transition-all font-label font-bold">
                 <LogOut className="w-5 h-5" />
                 Sign Out
               </button>
            </div>"""
            
new_logout_desktop = """            <div className="mt-2 flex flex-col gap-1">
               <div className="relative group/lang">
                   <button className="flex items-center justify-between w-full px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-all font-label font-bold">
                       <div className="flex items-center gap-3">
                           <Globe className="w-5 h-5" />
                           {t('Language')}
                       </div>
                       <span className="text-xs font-mono bg-surface-variant px-2 py-0.5 rounded-full">{language === 'en' ? 'EN' : language === 'zh-CN' ? '简' : '繁'}</span>
                   </button>
                   <div className="hidden group-hover/lang:flex flex-col absolute bottom-full left-0 w-full mb-2 bg-surface-container-highest rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden z-50 p-1">
                       <button onClick={() => setLanguage('en')} className={`px-4 py-2 text-sm font-label font-bold text-left rounded-xl hover:bg-surface-variant transition-colors ${language === 'en' ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}>{t('English')}</button>
                       <button onClick={() => setLanguage('zh-CN')} className={`px-4 py-2 text-sm font-label font-bold text-left rounded-xl hover:bg-surface-variant transition-colors ${language === 'zh-CN' ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}>{t('Simplified Chinese')}</button>
                       <button onClick={() => setLanguage('zh-TW')} className={`px-4 py-2 text-sm font-label font-bold text-left rounded-xl hover:bg-surface-variant transition-colors ${language === 'zh-TW' ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}>{t('Traditional Chinese')}</button>
                   </div>
               </div>
               <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 rounded-full text-error hover:bg-error-container/20 transition-all font-label font-bold">
                 <LogOut className="w-5 h-5" />
                 {t('Logout')}
               </button>
            </div>"""

content = content.replace(old_logout_desktop, new_logout_desktop)

# Add language switcher for mobile
old_logout_mobile = """                   <div className="mt-4 pt-4 border-t border-outline-variant/20">
                     <button onClick={handleLogout} className="flex items-center w-full gap-3 px-3 py-3 rounded-xl text-error hover:bg-error-container/20 transition-all font-label font-bold">
                       <LogOut className="w-5 h-5" />
                       Sign Out
                     </button>
                   </div>"""
                   
new_logout_mobile = """                   <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                       <div className="flex flex-col gap-1 p-2 bg-surface-variant/30 rounded-2xl">
                           <span className="px-2 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">{t('Language')}</span>
                           <button onClick={() => setLanguage('en')} className={`px-4 py-2 text-sm font-label font-bold text-left rounded-xl transition-colors ${language === 'en' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-variant'}`}>{t('English')}</button>
                           <button onClick={() => setLanguage('zh-CN')} className={`px-4 py-2 text-sm font-label font-bold text-left rounded-xl transition-colors ${language === 'zh-CN' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-variant'}`}>{t('Simplified Chinese')}</button>
                           <button onClick={() => setLanguage('zh-TW')} className={`px-4 py-2 text-sm font-label font-bold text-left rounded-xl transition-colors ${language === 'zh-TW' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-variant'}`}>{t('Traditional Chinese')}</button>
                       </div>
                     <button onClick={handleLogout} className="flex items-center w-full gap-3 px-3 py-3 rounded-xl text-error hover:bg-error-container/20 transition-all font-label font-bold">
                       <LogOut className="w-5 h-5" />
                       {t('Logout')}
                     </button>
                   </div>"""
                   
content = content.replace(old_logout_mobile, new_logout_mobile)

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(content)

