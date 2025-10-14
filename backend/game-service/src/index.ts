import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { authMiddleware } from './middleware/auth';
import authRouter from './routes/auth';
import healthRouter from './routes/health';
import { SocketHandler } from './socket/SocketHandler';

const app = express();
const server = createServer(app);
const PORT = 8001;

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://frontend:3000'],
    credentials: true,
  },
  allowEIO3: true,
});

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

// Socket.IO connection handling
const socketHandler = new SocketHandler(io);
io.on('connection', (socket) => {
  socketHandler.handleConnection(socket);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Game service listening on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
