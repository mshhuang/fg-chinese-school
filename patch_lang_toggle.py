import re
import sys

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

# Replace desktop lang dropdown
desktop_pattern = re.compile(r'<div className="relative group/lang">.*?</div>\n\s*<button onClick=\{handleLogout\}', re.DOTALL)
desktop_replacement = """<div className="flex w-full bg-gray-500 p-1 gap-1 mb-2">
                   <button onClick={() => setLanguage('en')} className={cn("flex-1 py-1.5 text-center text-sm transition-colors", language === 'en' ? "bg-[#f68121] text-gray-900 font-bold shadow-sm" : "bg-[#f68121]/70 text-gray-800 hover:bg-[#f68121]/90")}>Eng</button>
                   <button onClick={() => setLanguage('zh-CN')} className={cn("flex-1 py-1.5 text-center text-sm transition-colors", language === 'zh-CN' ? "bg-[#f68121] text-gray-900 font-bold shadow-sm" : "bg-[#f68121]/70 text-gray-800 hover:bg-[#f68121]/90")}>简体</button>
                   <button onClick={() => setLanguage('zh-TW')} className={cn("flex-1 py-1.5 text-center text-sm transition-colors", language === 'zh-TW' ? "bg-[#f68121] text-gray-900 font-bold shadow-sm" : "bg-[#f68121]/70 text-gray-800 hover:bg-[#f68121]/90")}>繁體</button>
               </div>
               <button onClick={handleLogout}"""

new_content = desktop_pattern.sub(desktop_replacement, content, count=1)

# Replace mobile lang dropdown
mobile_pattern = re.compile(r'<div className="flex flex-col gap-1 p-2 bg-surface-variant/30 rounded-2xl">.*?</div>\n\s*<button onClick=\{handleLogout\}', re.DOTALL)
mobile_replacement = """<div className="flex w-full bg-gray-500 p-1 gap-1 mb-2">
                           <button onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }} className={cn("flex-1 py-2 text-center text-sm transition-colors", language === 'en' ? "bg-[#f68121] text-gray-900 font-bold shadow-sm" : "bg-[#f68121]/70 text-gray-800 hover:bg-[#f68121]/90")}>Eng</button>
                           <button onClick={() => { setLanguage('zh-CN'); setIsMobileMenuOpen(false); }} className={cn("flex-1 py-2 text-center text-sm transition-colors", language === 'zh-CN' ? "bg-[#f68121] text-gray-900 font-bold shadow-sm" : "bg-[#f68121]/70 text-gray-800 hover:bg-[#f68121]/90")}>简体</button>
                           <button onClick={() => { setLanguage('zh-TW'); setIsMobileMenuOpen(false); }} className={cn("flex-1 py-2 text-center text-sm transition-colors", language === 'zh-TW' ? "bg-[#f68121] text-gray-900 font-bold shadow-sm" : "bg-[#f68121]/70 text-gray-800 hover:bg-[#f68121]/90")}>繁體</button>
                       </div>
                     <button onClick={handleLogout}"""

new_content = mobile_pattern.sub(mobile_replacement, new_content, count=1)

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(new_content)
