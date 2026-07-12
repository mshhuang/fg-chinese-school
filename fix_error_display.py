import re

with open('src/ErrorDisplay.tsx', 'r') as f:
    content = f.read()

new_handle_rejection = """
    const handleRejection = (e: PromiseRejectionEvent) => {
      const reasonStr = e.reason ? String(e.reason) : '';
      if (reasonStr.includes('WebSocket closed') || reasonStr.includes('failed to connect to websocket')) {
          console.warn('Ignored benign WebSocket error:', e.reason);
          return;
      }
      setError("Unhandled Promise Rejection: " + e.reason);
    };
"""

content = re.sub(r"    const handleRejection = \(e: PromiseRejectionEvent\) => \{[\s\S]*?\};\n", new_handle_rejection, content)

with open('src/ErrorDisplay.tsx', 'w') as f:
    f.write(content)
