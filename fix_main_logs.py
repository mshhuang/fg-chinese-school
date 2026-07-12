import re

with open('src/main.tsx', 'r') as f:
    content = f.read()

new_handle = """
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = event.reason ? String(event.reason) : '';
  if (reasonStr.includes('WebSocket closed') || reasonStr.includes('failed to connect to websocket')) {
      return; // Ignore benign websocket reconnect errors
  }
  logSystemEvent('error', `Unhandled Promise Rejection`, event.reason, window.location.pathname);
});
"""

content = re.sub(r"window\.addEventListener\('unhandledrejection', \(event\) => \{[\s\S]*?\}\);\n", new_handle, content)

with open('src/main.tsx', 'w') as f:
    f.write(content)
