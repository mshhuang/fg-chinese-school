import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

if 'const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);' not in content:
    content = content.replace(
        'const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);',
        'const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);\n  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);'
    )

old_desktop_lang = """               <div className="relative group/lang">
                   <button className="flex items-center justify-between w-full px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-all font-label font-bold">
                       <div className="flex items-center gap-3">
                           <Globe className="w-5 h-5" />
                           {t('Language')}
                       </div>
                       <span className="text-xs font-mono bg-surface-variant px-2 py-0.5 rounded-full">{language === 'en' ? 'EN' : language === 'zh-CN' ? '简' : '繁'}</span>
                   </button>
                   <div className="hidden group-hover/lang:flex flex-col absolute bottom-full left-0 w-full mb-2 bg-surface-container-highest rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden z-50 p-1">"""

new_desktop_lang = """               <div className="relative group/lang">
                   <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="flex items-center justify-between w-full px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-all font-label font-bold">
                       <div className="flex items-center gap-3">
                           <Globe className="w-5 h-5" />
                           {t('Language')}
                       </div>
                       <span className="text-xs font-mono bg-surface-variant px-2 py-0.5 rounded-full">{language === 'en' ? 'EN' : language === 'zh-CN' ? '简' : '繁'}</span>
                   </button>
                   {isLangMenuOpen && (
                   <div className="flex flex-col absolute bottom-[calc(100%+8px)] left-0 w-full bg-surface-container-highest rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden z-50 p-1">"""

content = content.replace(old_desktop_lang, new_desktop_lang)

content = content.replace(
    """                   </div>
               </div>
               <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 rounded-full text-error hover:bg-error-container/20 transition-all font-label font-bold">""",
    """                   </div>
                   )}
               </div>
               <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 rounded-full text-error hover:bg-error-container/20 transition-all font-label font-bold">"""
)

# And update the onClick inside the lang dropdown to also close the menu:
content = content.replace(
    """<button onClick={() => setLanguage('en')}""",
    """<button onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}"""
)
content = content.replace(
    """<button onClick={() => setLanguage('zh-CN')}""",
    """<button onClick={() => { setLanguage('zh-CN'); setIsLangMenuOpen(false); }}"""
)
content = content.replace(
    """<button onClick={() => setLanguage('zh-TW')}""",
    """<button onClick={() => { setLanguage('zh-TW'); setIsLangMenuOpen(false); }}"""
)


with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(content)

