import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { join } from "path";
import { existsSync } from "fs";
import router from "./routes";
import debugRouter from "./routes/debug";  // <-- ADDED LINE 1
import { logger } from "./lib/logger";

const app: Express = express();

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use("/api", debugRouter);  // <-- ADDED LINE 2

// In production, serve the built React frontend and handle SPA routing
if (process.env.NODE_ENV === "production") {
  const staticPath = join(process.cwd(), "artifacts/script-generator/dist/public");
  if (existsSync(staticPath)) {
    logger.info({ staticPath }, "Serving static frontend files");
    app.use(express.static(staticPath));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(join(staticPath, "index.html"));
    });
  } else {
    logger.warn({ staticPath }, "Static frontend path not found — skipping static file serving");
  }
}

export default app;
