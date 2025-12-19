import express, { Application, Request, Response } from 'express';
import connectMongoDB from './src/config/mongo.config';
import emailRoutes from './src/routes/email.routes';
import authRoutes from './src/routes/auth.routes';
import { PORT, ALLOWED_ORIGINS } from './src/config/env.config';
import cors from 'cors';

const app: Application = express();
const allowedOrigins = ALLOWED_ORIGINS.split(',');

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);

    callback(new Error("Not allowed by cors"));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/email', emailRoutes);
app.use('/api/auth', authRoutes);

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
      getEmails: 'GET /api/email?page=1&limit=50&status=sent&email=example@email.com',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
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