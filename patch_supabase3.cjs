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
                      message: errorData.message || 'Unknown error',
                      type: 'error',
                      details: JSON.stringify({ code: errorData.code, details: errorData.details, hint: errorData.hint, message: errorData.message }),
                      path: urlStr,
                      user_id: u_id
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

const startIdx = code.indexOf(`if (!res.ok && urlStr.includes('/rest/v1/') && !urlStr.includes('error_logs')`);
const endIdx = code.indexOf(`      if (isGet && cacheKey && res.ok) {`);

code = code.substring(0, startIdx) + correctBlock + "\n\n" + code.substring(endIdx);
fs.writeFileSync('src/lib/supabase.ts', code);
