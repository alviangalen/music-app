import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { apiRoutes } from "./routes.js";

dotenv.config();

const port = Number(process.env.PORT) || 5000;
const host = "0.0.0.0"; // Essential for container networking (binding to all interfaces)

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

// Enable CORS for local development when frontend runs independently
await server.register(cors, {
  origin: true,
  methods: ["GET", "OPTIONS"],
});

// Register API routes
await server.register(apiRoutes);

// Root route for quick verification
server.get("/", async (_request, reply) => {
  return reply.send({
    service: "music-app-backend",
    version: "1.0.0",
    status: "healthy",
    endpoints: {
      health: "/healthz",
      search: "/api/search?q=:query",
    },
  });
});

// Graceful shutdown on process termination
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
for (const signal of signals) {
  process.on(signal, async () => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await server.close();
      server.log.info("Server terminated cleanly.");
      process.exit(0);
    } catch (err) {
      server.log.error(err, "Error during server shutdown");
      process.exit(1);
    }
  });
}

const start = async () => {
  try {
    await server.listen({ port, host });
    server.log.info(`Backend listening on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();