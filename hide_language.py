with open('src/components/layout/MainLayout.tsx', 'r') as f:
    text = f.read()

desktop_code = """               <div className="flex w-full bg-surface-container-high rounded-xl p-1 gap-1 mb-2">
                   <button onClick={() => setLanguage('en')} className={cn("flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all", language === 'en' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>Eng</button>
                   <button onClick={() => setLanguage('zh-CN')} className={cn("flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all", language === 'zh-CN' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>简体</button>
                   <button onClick={() => setLanguage('zh-TW')} className={cn("flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all", language === 'zh-TW' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>繁體</button>
               </div>"""

mobile_code = """                       <div className="flex w-full bg-surface-container-high rounded-xl p-1 gap-1 mb-2 mt-1">
                           <button onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }} className={cn("flex-1 py-2 rounded-lg text-center text-sm font-bold transition-all", language === 'en' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>Eng</button>
                           <button onClick={() => { setLanguage('zh-CN'); setIsMobileMenuOpen(false); }} className={cn("flex-1 py-2 rounded-lg text-center text-sm font-bold transition-all", language === 'zh-CN' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>简体</button>
                           <button onClick={() => { setLanguage('zh-TW'); setIsMobileMenuOpen(false); }} className={cn("flex-1 py-2 rounded-lg text-center text-sm font-bold transition-all", language === 'zh-TW' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>繁體</button>
                       </div>"""

text = text.replace(desktop_code, '{/* Language Toggle Hidden */}')
text = text.replace(mobile_code, '{/* Language Toggle Hidden */}')

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(text)
