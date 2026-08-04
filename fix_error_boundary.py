with open('src/components/ErrorBoundary.tsx', 'r') as f:
    content = f.read()

import_replacement = """import React, { Component, ErrorInfo, ReactNode } from "react";
import { logSystemEvent } from "../lib/logSystemEvent";
import { useLanguage } from "../lib/i18n";

function DefaultFallback() {
  const { t } = useLanguage();
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

content = content.replace('import React, { Component, ErrorInfo, ReactNode } from "react";\nimport { logSystemEvent } from "../lib/logSystemEvent";', import_replacement)

render_replacement = """  public render() {
    if (this.state.hasError) {
      if ((this as any).props.fallback) {
        return (this as any).props.fallback;
      }
      return <DefaultFallback />;
    }
    return (this as any).props.children;
  }"""

import re
content = re.sub(r'public render\(\) \{[\s\S]*\}\s*return \(this as any\).props.children;\s*\}', render_replacement, content)

with open('src/components/ErrorBoundary.tsx', 'w') as f:
    f.write(content)
print("Updated ErrorBoundary")
