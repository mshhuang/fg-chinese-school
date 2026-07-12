import re

with open('src/main.tsx', 'r') as f:
    content = f.read()

new_error_intercept = """
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  if (isLoggingConsole) return;
  const message = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
  if (message.includes('WebSocket closed') || message.includes('failed to connect to websocket')) return;
  
  if (loggedMessages.has(message)) return;
  loggedMessages.add(message);
  
  isLoggingConsole = true;
  logSystemEvent('error', `Console Error: ${message.substring(0, 200)}`, message, window.location.pathname)
    .finally(() => { isLoggingConsole = false; });
};
"""

content = re.sub(r"const originalConsoleError = console\.error;\nconsole\.error = \(\.\.\.args\) => \{[\s\S]*?\}\);\n\};\n", new_error_intercept, content)

with open('src/main.tsx', 'w') as f:
    f.write(content)
