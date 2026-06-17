import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Nodemailer SMTP initialization (lazy, or check for key)
  let transporter: nodemailer.Transporter | null = null;
  const getTransporter = () => {
    if (!transporter) {
      const key = process.env.RESEND_API_KEY;
      if (!key) {
        throw new Error('RESEND_API_KEY environment variable is required');
      }
      transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        secure: true,
        port: 465,
        auth: {
          user: 'resend',
          pass: key,
        },
      });
    }
    return transporter;
  };

  // API routing for sending email
  app.post("/api/messages/send", async (req, res) => {
    try {
      const mailer = getTransporter();
      const { to, subject, text, html } = req.body;

      if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ error: "Missing required fields: to, subject, and text/html" });
      }

      const info = await mailer.sendMail({
        // For testing, standard Resend allows sending from 'onboarding@resend.dev' to self
        // In production, this should be a verified domain
        from: 'Nexus Academy <onboarding@resend.dev>',
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        text: text,
        html: html,
      });

      res.status(200).json({ success: true, data: info });
    } catch (error: any) {
      console.error("Error sending email over SMTP:", error);
      res.status(500).json({ error: error.message || "Failed to send email via SMTP" });
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
