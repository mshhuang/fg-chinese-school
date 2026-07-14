import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });


  app.post("/api/supabase/proxy", express.json(), async (req, res) => {
    const { ref, pat, path = '' } = req.body;
    if (!ref || !pat) {
       return res.status(400).json({ error: 'Missing ref or pat' });
    }
    try {
      // Try to fetch project info as a test, or a specific analytics endpoint
      const targetUrl = `https://api.supabase.com/v1/projects/${ref}${path}`;
      const response = await fetch(targetUrl, {
        headers: {
          'Authorization': `Bearer ${pat}`,
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

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
