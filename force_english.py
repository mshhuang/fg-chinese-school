with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

old_use_effect = """  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && ['en', 'zh-CN', 'zh-TW'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);"""

new_use_effect = """  useEffect(() => {
    localStorage.setItem('app_language', 'en');
    setLanguageState('en');
  }, []);"""

text = text.replace(old_use_effect, new_use_effect)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
