import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const replacement = `
            <button 
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-on-primary py-3.5 rounded-full font-label font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
            <div className="mt-2 text-center">
               <button 
                  type="button" 
                  onClick={() => { setEmail('demo'); setPassword('demo'); }} 
                  className="text-xs text-on-surface-variant font-label hover:text-primary transition-colors underline decoration-dotted"
               >
                  Use Demo Account
               </button>
            </div>
`;

content = content.replace(`
            <button 
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-on-primary py-3.5 rounded-full font-label font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
`, replacement);

fs.writeFileSync('src/pages/Login.tsx', content);
