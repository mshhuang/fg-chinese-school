const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newRoute = `
  app.post("/api/supabase/proxy", express.json(), async (req, res) => {
    const { ref, pat, path = '' } = req.body;
    if (!ref || !pat) {
       return res.status(400).json({ error: 'Missing ref or pat' });
    }
    try {
      // Try to fetch project info as a test, or a specific analytics endpoint
      const targetUrl = \`https://api.supabase.com/v1/projects/\${ref}\${path}\`;
      const response = await fetch(targetUrl, {
        headers: {
          'Authorization': \`Bearer \${pat}\`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || response.statusText });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
`;

content = content.replace('  // Vite middleware for development', newRoute);
fs.writeFileSync('server.ts', content);
