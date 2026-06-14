import app from "./app";
import { logger } from "./lib/logger";
import { db } from "./lib/db";
import { sql } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Keep the Neon (Replit PostgreSQL) endpoint awake.
  // Neon auto-suspends compute endpoints after ~5 min of inactivity.
  // A suspended endpoint causes "The endpoint has been disabled" errors
  // when drizzle-kit push runs (post-merge or Replit's pre-publish diff check).
  const pingDb = async () => {
    try {
      await db.execute(sql`SELECT 1`);
      logger.debug("DB keep-alive ping OK");
    } catch (err) {
      logger.warn({ err }, "DB keep-alive ping failed — retrying in 10s");
      // If the endpoint is waking up, retry once after a short delay
      setTimeout(pingDb, 10_000);
    }
  };

  // Ping immediately on startup so the endpoint is awake before any
  // Replit pre-publish diff check or drizzle-kit push runs.
  pingDb();

  // Then keep pinging every 4 minutes to prevent suspension.
  setInterval(pingDb, 4 * 60 * 1000);
});
