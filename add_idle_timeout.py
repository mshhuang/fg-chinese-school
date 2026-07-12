import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

idle_code = """
  // Idle Timeout (45 minutes)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, 45 * 60 * 1000); // 45 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, []);
"""

content = re.sub(r"(export default function MainLayout.*?\{\n)", r"\1" + idle_code, content, count=1)

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(content)
