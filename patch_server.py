import re

with open('server.ts', 'r') as f:
    content = f.read()

target = "  app.post('/api/github/sync'"

replacement = """  app.post('/api/gemini/generate', express.json(), async (req, res) => {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a helpful AI assistant for parents using the school portal. Answer questions politely and concisely.",
        }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini error:', error);
      res.status(500).json({ error: error.message || 'Error communicating with Gemini' });
    }
  });

  app.post('/api/github/sync'"""

if target in content:
    content = content.replace(target, replacement)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched server.ts")
else:
    print("Target not found in server.ts!")
