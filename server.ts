import express, { Application, Request, Response } from 'express';
import connectMongoDB from './src/config/mongo.config';
import emailRoutes from './src/routes/email.routes';
import { PORT } from './src/config/env.config';
import cors from 'cors';

const app: Application = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/email', emailRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Email service is running' });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Email Service API',
    endpoints: {
      health: '/health',
      sendEmail: 'POST /api/email/send',
    },
  });
});

// Start server and connect to database
const startServer = async (): Promise<void> => {
  try { // Connect to MongoDB
    await connectMongoDB();

    app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();