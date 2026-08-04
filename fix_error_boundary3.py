import re
with open('src/components/ErrorBoundary.tsx', 'r') as f:
    content = f.read()

replacement = """
  public render() {
    if (this.state.hasError) {
      if ((this as any).props.fallback) {
        return (this as any).props.fallback;
      }
      
      const lang = (localStorage.getItem('app_language') as string) || 'en';
      
      const t = (key: string) => {
        const translations: Record<string, any> = {
          "Something went wrong": { en: "Something went wrong", 'zh-CN': "出错了", 'zh-TW': "出錯了" },
          "An unexpected error occurred. We've logged this issue for our system builders to investigate.": { en: "An unexpected error occurred. We've logged this issue for our system builders to investigate.", 'zh-CN': "发生意外错误。我们已记录此问题，系统构建者将进行调查。", 'zh-TW': "發生意外錯誤。我們已記錄此問題，系統構建者將進行調查。" },
          "Refresh Page": { en: "Refresh Page", 'zh-CN': "刷新页面", 'zh-TW': "刷新頁面" },
        };
        return (translations[key] && translations[key][lang]) ? translations[key][lang] : key;
      };

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
    return (this as any).props.children;
  }
"""

content = re.sub(r'public render\(\) \{[\s\S]*\}\s*return \(this as any\)\.props\.children;\s*\}', replacement, content)

with open('src/components/ErrorBoundary.tsx', 'w') as f:
    f.write(content)
