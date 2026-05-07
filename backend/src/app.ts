import cors from "cors";
import express from "express";
import morgan from "morgan";

import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { buildApiRouter } from "./routes";

export function createApp(): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "12mb" }));
  app.use(express.urlencoded({ extended: true, limit: "12mb" }));
  app.use(morgan("dev"));

  app.get("/", (_req, res) => {
    res.json({
      name: "Red de Comunidad Aeronautica · backend",
      version: "1.0.0",
      docs: "/api/health",
    });
  });

  app.use("/api", buildApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
