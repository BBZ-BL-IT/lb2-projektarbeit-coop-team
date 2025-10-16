import cors from "cors";
import express, { Express } from "express";
import { initializeDatabase } from "./db";
import healthRouter from "./routes/health";
import statsRouter from "./routes/stats";
import { MqttSubscriber } from "./services/MqttSubscriber";

async function bootstrap(): Promise<void> {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }

  const app: Express = express();
  const port = Number(process.env.PORT || 8003);

  const defaultOrigins = ["http://localhost:3000", "http://frontend:3000"];
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin: string) =>
        origin.trim()
      )
    : defaultOrigins;

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(healthRouter);
  app.use(statsRouter);

  app.listen(port, () => {
    console.log(`Stats service listening on port ${port}`);
  });

  new MqttSubscriber();
}

void bootstrap();
