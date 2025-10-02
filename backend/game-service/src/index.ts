import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

// Load environment variables from the project root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = 8001;
const JWT_SECRET = process.env.JWT_SECRET;
const AUTH_URL = 'http://localhost:8002';

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

// JWT Authentication middleware
app.use((req, res, next) => {
  // Skip auth for health check
  if (req.path === '/health') {
    return next();
  }

  // Try to get token from multiple sources
  let token: string | null = null;

  // First try Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }
  // Then try auth cookie
  else if (req.cookies.auth) {
    token = req.cookies.auth;
  }
  // Finally try raw authorization header
  else if (req.headers.authorization) {
    token = req.headers.authorization;
  }

  if (!token) {
    console.error('No auth token found - returning 401');
    return res.status(401).json({
      error: 'Authentication required',
      message: 'No auth token found. Please login first.',
      authUrl: AUTH_URL,
      statusCode: 401,
    });
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured - server misconfiguration');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Authentication service is not properly configured.',
      statusCode: 500,
    });
  }

  // At this point we know both token and JWT_SECRET are defined
  const tokenToVerify: string = token;
  const secretToUse: string = JWT_SECRET;

  return jwt.verify(tokenToVerify, secretToUse, (err: any, decoded: any) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      console.error(
        'JWT Secret being used:',
        JWT_SECRET ? JWT_SECRET.substring(0, 10) + '...' : 'undefined',
      );

      return res.status(401).json({
        error: 'Invalid authentication token',
        message: 'Your session has expired or is invalid. Please login again.',
        details: err.message,
        authUrl: AUTH_URL,
        statusCode: 401,
      });
    }

    console.log(
      'JWT verified successfully for user:',
      decoded.sub || decoded.username || 'unknown',
    );
    // Add decoded token to request object for use in routes
    (req as any).auth = decoded;
    return next();
  });
});

// Health check route (no auth required)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'game-service',
    timestamp: new Date().toISOString(),
  });
});

// Example protected route
app.get('/auth', (req, res) => {
  const auth = (req as any).auth;
  res.json({
    message: 'Welcome to the game service!',
    user: auth,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Game service listening on port ${PORT}`);
});
