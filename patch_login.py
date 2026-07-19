import re

with open('src/pages/Login.tsx', 'r') as f:
    content = f.read()

target = """          // Also log the login activity
          let ipAddress = 'Unknown';
          try {
             const res = await fetch('https://api.ipify.org?format=json');
             if (res.ok) {
                const data = await res.json();
                ipAddress = data.ip;
             }
          } catch (e) { }"""

replacement = """          // Also log the login activity
          let ipAddress = 'Unknown';
          try {
             const controller = new AbortController();
             const timeoutId = setTimeout(() => controller.abort(), 1500);
             const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
             clearTimeout(timeoutId);
             if (res.ok) {
                const data = await res.json();
                ipAddress = data.ip;
             }
          } catch (e) { }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/pages/Login.tsx', 'w') as f:
        f.write(content)
    print("Patched Login.tsx")
else:
    print("Target not found!")
