import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load configuration variables from system or .env file
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Crucial: Use express.json body parser for incoming fetch payloads
  app.use(express.json());

  // API Proxy Route for securing third-party Resend credentials and avoiding CORS errors
  app.post("/api/send-email", async (req: any, res: any) => {
    try {
      const { to, subject, text, from } = req.body;
      
      // Fallback precedence: check server process env first, then custom headers from request
      const resendApiKey = 
        process.env.RESEND_API_KEY || 
        process.env.VITE_RESEND_API_KEY || 
        req.headers["x-resend-api-key"] || 
        req.body.apiKey;

      if (!resendApiKey) {
        console.warn("[Server Error] Attempted to dispatch email but no Resend API key was detected.");
        return res.status(401).json({
          error: "Resend key is not configured. Please supply VITE_RESEND_API_KEY in system Secrets."
        });
      }

      console.log(`[Server API] Securely routing email payload to ${Array.isArray(to) ? to.join(', ') : to}...`);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: from || "MaatriSparsh Care <care@maatrisparsh.com>",
          to: typeof to === "string" ? [to] : to,
          subject: subject,
          text: text
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Server API] Resend returned external failure: ${errorText}`);
        return res.status(response.status).json({
          error: `Resend API failed with status ${response.status}: ${errorText}`
        });
      }

      const resJson = await response.json();
      console.log(`[Server API] Resend successfully dispatched transaction: ${JSON.stringify(resJson)}`);
      return res.json({ success: true, data: resJson });
    } catch (err: any) {
      console.error("[Server API] Dynamic error triggering Resend proxy service:", err);
      return res.status(500).json({
        error: `Failed to proxy booking notification via Resend: ${err.message || "Unknown error"}`
      });
    }
  });

  // Hot module replacement or static hosting setup based on development context
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Launching fast developmental Vite middleware asset compiler...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Serving static production assets from /dist client directory...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server Ready] Full-stack application bound on port http://localhost:${PORT}`);
  });
}

startServer().catch((fatalError) => {
  console.error("[Fatal Startup] Failed to boot full-stack microservice layer:", fatalError);
});
