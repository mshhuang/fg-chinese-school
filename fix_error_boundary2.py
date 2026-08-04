with open('src/components/ErrorBoundary.tsx', 'r') as f:
    content = f.read()

import_replacement = """import React, { Component, ErrorInfo, ReactNode } from "react";
import { logSystemEvent } from "../lib/logSystemEvent";

const translations: Record<string, any> = {
  "Something went wrong": { en: "Something went wrong", 'zh-CN': "出错了", 'zh-TW': "出錯了" },
  "An unexpected error occurred. We've logged this issue for our system builders to investigate.": { en: "An unexpected error occurred. We've logged this issue for our system builders to investigate.", 'zh-CN': "发生意外错误。我们已记录此问题，系统构建者将进行调查。", 'zh-TW': "發生意外錯誤。我們已記錄此問題，系統構建者將進行調查。" },
  "Refresh Page": { en: "Refresh Page", 'zh-CN': "刷新页面", 'zh-TW': "刷新頁面" },
};

function DefaultFallback() {
  const lang = (localStorage.getItem('app_language') as string) || 'en';
  const t = (key: string) => (translations[key] && translations[key][lang]) ? translations[key][lang] : key;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center w-full h-full min-h-[300px]">
      <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-4">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h2 className="font-display text-xl font-bold text-on-surface mb-2">{t("Something went wrong")}</h2>
      <p className="font-body text-on-surface-variant max-w-md">
        {t("An unexpected error occurred. We've logged this issue for our system builders to investigate.")}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-primary text-on-primary rounded-full font-label font-bold text-sm"
      >
        {t("Refresh Page")}
      </button>
    </div>
  );
}
"""

import re
content = re.sub(r'import React, \{ Component, ErrorInfo, ReactNode \} from "react";\nimport \{ logSystemEvent \} from "\.\./lib/logSystemEvent";\nimport \{ useLanguage \} from "\.\./lib/i18n";\n\nfunction DefaultFallback\(\) \{\n  const \{ t \} = useLanguage\(\);\n  return \(\n    <div className="flex flex-col items-center justify-center p-8 text-center w-full h-full min-h-\[300px\]">\n      <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-4">\n         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>\n      </div>\n      <h2 className="font-display text-xl font-bold text-on-surface mb-2">\{t\("Something went wrong"\)\}</h2>\n      <p className="font-body text-on-surface-variant max-w-md">\n        \{t\("An unexpected error occurred\. We've logged this issue for our system builders to investigate\."\)\}\n      </p>\n      <button \n        onClick=\{\(\) => window\.location\.reload\(\)\}\n        className="mt-6 px-4 py-2 bg-primary text-on-primary rounded-full font-label font-bold text-sm"\n      >\n        \{t\("Refresh Page"\)\}\n      </button>\n    </div>\n  \);\n\}', import_replacement, content)

with open('src/components/ErrorBoundary.tsx', 'w') as f:
    f.write(content)
print("Updated ErrorBoundary")
