require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: `
CREATE OR REPLACE VIEW credentials_report AS
SELECT 
  r.role_name as role,
  u.first_name || ' ' || u.last_name as name,
  u.email,
  u.user_name,
  u.password_hash as password
FROM 
  users u
JOIN 
  user_roles ur ON u.user_id = ur.user_id
JOIN 
  roles r ON ur.role_id = r.role_id
WHERE 
  r.role_name IN ('Student', 'Teacher');
`});
  console.log("Create view:", data, error);
}
run();
