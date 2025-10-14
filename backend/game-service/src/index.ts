import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { authMiddleware } from './middleware/auth';
import authRouter from './routes/auth';
import healthRouter from './routes/health';

const app = express();
const PORT = 8001;

// Middlewares
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8002'], // Allow both frontend and auth service
    credentials: true, // Important for cookies
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply authentication middleware globally
app.use(authMiddleware);

// Routes
app.use(healthRouter);
app.use(authRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Game service listening on port ${PORT}`);
});
