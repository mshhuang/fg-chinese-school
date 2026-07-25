const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const messageEndpoint = `
  app.post('/api/messages/send', express.json(), async (req, res) => {
    try {
      const { to, subject, text } = req.body;
      const resend = new Resend(process.env.RESEND_API_KEY || 're_123');
      
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not found, skipping actual email send.');
        return res.json({ success: true, mocked: true });
      }
      
      const { data, error } = await resend.emails.send({
        from: 'Nexus Academy <onboarding@resend.dev>',
        to: to,
        subject: subject || 'Message from Nexus Academy',
        html: \`<p>\${text}</p>\`
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.json({ success: true, data });
    } catch (err) {
      console.error('Email send error:', err);
      res.status(500).json({ error: err.message });
    }
  });
`;

if (!content.includes('/api/messages/send')) {
    content = content.replace('app.get("/api/health", (req, res) => {', messageEndpoint + '\n  app.get("/api/health", (req, res) => {');
    fs.writeFileSync('server.ts', content);
    console.log('patched server.ts messages endpoint');
}
