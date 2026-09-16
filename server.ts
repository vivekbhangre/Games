import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { setupGameHandlers } from "./src/server/game.js";
import os from "os";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Setup game socket.io events
  setupGameHandlers(io);

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`\n========================================`);
    console.log(`  🚀 Server is up and running!`);
    console.log(`========================================`);
    console.log(`  Local:   http://localhost:${PORT}`);
    
    // Attempt to print the local network IP
    try {
      const networkInterfaces = os.networkInterfaces();
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        if (interfaces) {
          for (const iface of interfaces) {
            // Skip internal and non-IPv4 addresses
            if (!iface.internal && iface.family === 'IPv4') {
              console.log(`  Network: http://${iface.address}:${PORT}`);
            }
          }
        }
      }
    } catch (e) {
      // Ignore errors if os module fails for some reason
    }
    
    console.log(`========================================\n`);
  });
}

startServer();
