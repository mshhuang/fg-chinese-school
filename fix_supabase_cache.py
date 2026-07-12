import re

with open('src/lib/supabase.ts', 'r') as f:
    content = f.read()

new_fetch = """
const queryCache = new Map<string, { data: any, timestamp: number, response: Response }>();
const CACHE_TTL = 30000; // 30 seconds

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
      const isGet = !options?.method || options.method === 'GET';
      const urlStr = url.toString();
      
      let cacheKey = null;
      if (isGet && urlStr.includes('/rest/v1/')) {
         // Create a cache key based on URL and Headers
         let headersStr = '';
         if (options?.headers) {
             headersStr = JSON.stringify(options.headers);
         }
         cacheKey = urlStr + '|' + headersStr;
         
         const cached = queryCache.get(cacheKey);
         if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
             // Return a cloned response so it can be consumed multiple times
             return cached.response.clone();
         }
      }

      const res = await fetch(url, options);
      
      if (isGet && cacheKey && res.ok) {
          queryCache.set(cacheKey, {
              data: null, // Not used, just storing response
              timestamp: Date.now(),
              response: res.clone()
          });
      }

      try {
"""

content = re.sub(r"export const supabase = createClient<any>\(.*?, \{[\s\S]*?global: \{[\s\S]*?fetch: async \(url: RequestInfo \| URL, options\?: RequestInit\) => \{", new_fetch, content)

with open('src/lib/supabase.ts', 'w') as f:
    f.write(content)
