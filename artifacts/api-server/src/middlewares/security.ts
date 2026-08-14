import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";

export function securityHeaders(): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://*.clerk.accounts.dev",
          "https://*.clerk.dev",
          "https://*.clerk.com",
          "https://challenges.cloudflare.com",
        ],
        workerSrc: ["'self'", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: [
          "'self'",
          "https:",
          "wss:",
          "https://*.clerk.accounts.dev",
          "https://*.clerk.dev",
          "https://*.clerk.com",
          "https://api.clerk.com",
        ],
        fontSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        frameSrc: [
          "'self'",
          "https://*.clerk.accounts.dev",
          "https://*.clerk.dev",
          "https://*.clerk.com",
          "https://challenges.cloudflare.com",
        ],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
}

const rateLimitMessage = { error: "Too many requests, please try again later." };

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
  skip: (req) => req.path === "/health",
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

export const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});
