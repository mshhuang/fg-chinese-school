import re

with open('src/lib/supabase.ts', 'r') as f:
    content = f.read()

replacement = """
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
"""

content = re.sub(
r'                  const payload = \{.*?                  \};',
replacement.strip('\n'),
content,
flags=re.DOTALL
)

with open('src/lib/supabase.ts', 'w') as f:
    f.write(content)
