import express, { type Express } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
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
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
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

const clerkPublishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ||
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_dmFzdC1zbmlwZS02LmNsZXJrLmFjY291bnRzLmRldiQ";

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      clerkPublishableKey,
    ),
  })),
);

app.use("/api", router);

export default app;
