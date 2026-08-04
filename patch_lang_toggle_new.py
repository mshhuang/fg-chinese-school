import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

desktop_pattern = re.compile(r'<div className="flex w-full bg-gray-500 p-\[2px\] gap-\[2px\] mb-2">.*?</div>', re.DOTALL)
desktop_replacement = """<div className="flex w-full bg-surface-container-high rounded-xl p-1 gap-1 mb-2">
                   <button onClick={() => setLanguage('en')} className={cn("flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all", language === 'en' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>Eng</button>
                   <button onClick={() => setLanguage('zh-CN')} className={cn("flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all", language === 'zh-CN' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>简体</button>
                   <button onClick={() => setLanguage('zh-TW')} className={cn("flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all", language === 'zh-TW' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>繁體</button>
               </div>"""

new_content = desktop_pattern.sub(desktop_replacement, content, count=1)

mobile_pattern = re.compile(r'<div className="flex w-full bg-gray-500 p-\[2px\] gap-\[2px\] mb-2">.*?</div>', re.DOTALL)
mobile_replacement = """<div className="flex w-full bg-surface-container-high rounded-xl p-1 gap-1 mb-2 mt-1">
                           <button onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }} className={cn("flex-1 py-2 rounded-lg text-center text-sm font-bold transition-all", language === 'en' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>Eng</button>
                           <button onClick={() => { setLanguage('zh-CN'); setIsMobileMenuOpen(false); }} className={cn("flex-1 py-2 rounded-lg text-center text-sm font-bold transition-all", language === 'zh-CN' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>简体</button>
                           <button onClick={() => { setLanguage('zh-TW'); setIsMobileMenuOpen(false); }} className={cn("flex-1 py-2 rounded-lg text-center text-sm font-bold transition-all", language === 'zh-TW' ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/50")}>繁體</button>
                       </div>"""

new_content = mobile_pattern.sub(mobile_replacement, new_content, count=1)

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(new_content)
