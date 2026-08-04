const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

const correctBlock = `if (!res.ok && urlStr.includes('/rest/v1/') && !urlStr.includes('error_logs') && !urlStr.includes('system_logs')) {
          const clonedRes = res.clone();
          clonedRes.text().then(text => {
              let errorData = null;
              try { errorData = JSON.parse(text); } catch (e) { errorData = { message: text }; }
              if (errorData && (errorData.code || errorData.message)) {
                  let user = {};
                  try {
                      const userStr = localStorage.getItem('user');
                      if (userStr) user = JSON.parse(userStr);
                  } catch (e) {}
                  
                  const u_id = user?.id && user?.id !== 'demo' && user?.id !== 'builder_secret' ? user?.id : null;
                  
                  const payload = {
                      error_message: errorData.message || 'Unknown error',
                      error_code: errorData.code || String(res.status),
                      error_details: errorData.details || errorData.hint || JSON.stringify(errorData),
                      request_url: urlStr,
                      request_method: method,
                      user_id: u_id,
                      browser_info: typeof navigator !== 'undefined' ? navigator.userAgent : 'system'
                  };
                  
                  fetch(\`\${supabaseUrl}/rest/v1/error_logs\`, {
                      method: 'POST',
                      headers: {
                          'apikey': supabaseAnonKey,
                          'Authorization': \`Bearer \${supabaseAnonKey}\`,
                          'Content-Type': 'application/json',
                          'Prefer': 'return=minimal'
                      },
                      body: JSON.stringify(payload)
                  }).catch(() => {});
              }
          }).catch(() => {});
      }`;

// Find the block from `if (!res.ok` to the matching `}`
const startIdx = code.indexOf(`if (!res.ok && urlStr.includes('/rest/v1/') && !urlStr.includes('error_logs')`);
const endIdx = code.indexOf(`      if (isGet && cacheKey && res.ok) {`);

code = code.substring(0, startIdx) + correctBlock + "\n\n" + code.substring(endIdx);
fs.writeFileSync('src/lib/supabase.ts', code);
