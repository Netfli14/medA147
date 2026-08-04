import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";
import { securityHeaders, generalLimiter } from "./middlewares/security";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const ALLOWED_ORIGINS = [
  /\.replit\.dev$/,
  /\.replit\.app$/,
  /\.repl\.co$/,
  /^http:\/\/localhost(:\d+)?$/,
];

app.set("trust proxy", 1);

app.use(securityHeaders());

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = ALLOWED_ORIGINS.some((pattern) =>
        typeof pattern === "string" ? origin === pattern : pattern.test(origin)
      );
      callback(allowed ? null : new Error("Not allowed by CORS"), allowed);
    },
  })
);

app.use(generalLimiter);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use("/api/premium/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use((req, res, next) => {
  const secKey = process.env.CLERK_SECRET_KEY;
  if (!secKey || secKey.startsWith("sk_test_mock") || secKey === "mock_key") {
    // Skip Clerk middleware in mock mode to allow painless offline testing/rendering!
    return next();
  }
  return clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  }))(req, res, next);
});

app.use("/api", router);

// Serve static frontend files if they exist (for Render.com / unified production hosting)
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const staticPath = path.resolve(__dirname, "../../medai/dist/public");

if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  // Serve index.html for any client-side SPA routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

export default app;
