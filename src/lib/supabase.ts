import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';


const queryCache = new Map<string, { data: any, timestamp: number, response: Response }>();
const CACHE_TTL = 30000; // 30 seconds

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
      const urlStr = url.toString();
      const method = options?.method || 'GET';
      
      // Stop recording/modifying system_logs table as requested, except for password reminder requests, logins, errors, and page visits
      if (urlStr.includes('system_logs') && ['POST', 'PATCH', 'PUT'].includes(method)) {
        const bodyStr = options?.body ? options.body.toString() : '';
        const lowerBody = bodyStr.toLowerCase();
        const isPasswordRequest = lowerBody.includes('password reminder');
        const isLogin = lowerBody.includes('login') || lowerBody.includes('logged into');
        const isPageVisit = lowerBody.includes('page visit') || lowerBody.includes('visited page');
        const isError = bodyStr.includes('[ERROR]');
        
        if (!isPasswordRequest && !isLogin && !isPageVisit && !isError) {
          return new Response(JSON.stringify([]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      const isGet = !options?.method || options.method === 'GET';
      
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
      
      // Catch system postgres errors and record to error_logs table
      if (!res.ok && urlStr.includes('/rest/v1/') && !urlStr.includes('error_logs') && !urlStr.includes('system_logs')) {
          const clonedRes = res.clone();
          clonedRes.text().then(text => {
              let errorData = null;
              try { errorData = JSON.parse(text); } catch (e) { errorData = { message: text }; }
              if (errorData && (errorData.code || errorData.message)) {
                  let user: any = {};
                  try {
                      const userStr = localStorage.getItem('user');
                      if (userStr) user = JSON.parse(userStr);
                  } catch (e) {}
                  
                  const u_id = user?.id && user?.id !== 'demo' && user?.id !== 'builder_secret' ? user?.id : null;
                  
                  let requestBodyStr = null;
                  if (options?.body) {
                      try {
                          requestBodyStr = options.body.toString();
                      } catch (e) {}
                  }
                  
                  let customHint = errorData.hint;
                  if (errorData.message && errorData.message.includes('canceling statement due to statement timeout')) {
                      customHint = 'Timeout likely caused by: missing indexes, large payloads, or unoptimized query. Check table size and query filters.';
                  }

                  const payload = {
                      message: errorData.message || 'Unknown error',
                      type: 'error',
                      details: JSON.stringify({ 
                          code: errorData.code, 
                          details: errorData.details, 
                          hint: customHint || errorData.hint, 
                          message: errorData.message,
                          method: options?.method || 'GET',
                          requestBody: requestBodyStr
                      }),
                      path: urlStr,
                      user_id: u_id
                  };
                  
                  fetch(`${supabaseUrl}/rest/v1/error_logs`, {
                      method: 'POST',
                      headers: {
                          'apikey': supabaseAnonKey,
                          'Authorization': `Bearer ${supabaseAnonKey}`,
                          'Content-Type': 'application/json',
                          'Prefer': 'return=minimal'
                      },
                      body: JSON.stringify(payload)
                  }).catch(() => {});
              }
          }).catch(() => {});
      }

      if (isGet && cacheKey && res.ok) {
          queryCache.set(cacheKey, {
              data: null, // Not used, just storing response
              timestamp: Date.now(),
              response: res.clone()
          });
      }

      try {
        if (options && options.method && ['POST', 'PATCH', 'DELETE', 'PUT'].includes(options.method)) {
          queryCache.clear(); // Invalidate cache on mutation
          const urlStr = url.toString();
          if (urlStr.includes('/rest/v1/') && !urlStr.includes('system_logs') && !urlStr.includes('error_logs')) {
            const tablePath = urlStr.split('/rest/v1/')[1]?.split('?')[0];
            let actionStr = 'Modified';
            if (options.method === 'POST') actionStr = 'Created record in';
            if (options.method === 'PATCH' || options.method === 'PUT') actionStr = 'Updated record in';
            if (options.method === 'DELETE') actionStr = 'Deleted record in';
            
            let details = null;
            if (options.body) {
                try {
                    details = JSON.parse(options.body.toString());
                } catch(e) {}
            }
            
            const userStr = localStorage.getItem('user');
            let user: any = {};
            if (userStr) {
              try { user = JSON.parse(userStr); } catch (e) {}
            }
            
            const u_id = user?.id && user?.id !== 'demo' && user?.id !== 'builder_secret' ? user?.id : null;
            let userName = user?.id ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() : 'Anonymous';
            if (!userName) userName = 'Anonymous';
            
            const payload = {
               user_id: u_id,
               user_name: userName,
               user_role: user?.role || 'system',
               page_name: 'Database Activity',
               path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
               activity: `[${actionStr}] ${tablePath || 'unknown table'}`,
               action_type: options.method.toLowerCase(),
               data_changed: details,
               browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'system',
               ip_address: 'System',
               device_type: 'Frontend Intercept'
            };

            // Stop recording into system_logs table as requested
            /*
            fetch(`${supabaseUrl}/rest/v1/system_logs`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            }).catch(() => {});
            */
          }
        }
      } catch (logErr) {
      }

      return res;
    }
  }
});
