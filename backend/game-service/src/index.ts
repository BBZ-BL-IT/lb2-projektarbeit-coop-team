import cors from 'cors';
import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT || '8001', 10);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'game-service',
    timestamp: new Date().toISOString(),
  });
});

// Sample GET route
app.get('/api/v1/sample', (_req, res) => {
  res.json({ message: 'Hello from game-service sample route' });
});

// Sample POST echo route
app.post('/api/v1/echo', (req, res) => {
  res.json({ youPosted: req.body });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Game service listening on port ${PORT}`);
});
