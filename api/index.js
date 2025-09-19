import dotenv from "dotenv";
dotenv.config();

// Disable SSL certificate verification for Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import express from "express";
import { registerRoutes } from "../server/routes.js";

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware for request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Initialize routes
let server;
registerRoutes(app).then((s) => {
  server = s;
}).catch(console.error);

// Export as Vercel serverless function
export default app;