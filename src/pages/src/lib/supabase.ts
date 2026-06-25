import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
      const res = await fetch(url, options);
      
      try {
        if (options && options.method && ['POST', 'PATCH', 'DELETE', 'PUT'].includes(options.method)) {
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
            
            const u_id = user.id && user.id !== 'demo' && user.id !== 'builder_secret' ? user.id : null;
            let userName = user.id ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Anonymous';
            if (!userName) userName = 'Anonymous';
            
            const payload = {
               user_id: u_id,
               user_name: userName,
               user_role: user.role || 'system',
               page_name: 'Database Activity',
               path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
               activity: `[${actionStr}] ${tablePath || 'unknown table'}`,
               action_type: options.method.toLowerCase(),
               data_changed: details,
               browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'system',
               ip_address: 'System',
               device_type: 'Frontend Intercept'
            };

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
          }
        }
      } catch (logErr) {
      }

      return res;
    }
  }
});
