with open('src/pages/Login.tsx', 'r') as f:
    content = f.read()

target = """            <div className="mt-2 text-center">
               <button 
                  type="button" 
                  onClick={() => { setEmail('demo'); setPassword('demo'); }} 
                  className="text-xs text-on-surface-variant font-label hover:text-primary transition-colors underline decoration-dotted"
               >
                  Use Demo Account
               </button>
            </div>"""

content = content.replace(target, "")

with open('src/pages/Login.tsx', 'w') as f:
    f.write(content)
