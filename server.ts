import express, { Application, Request, Response } from 'express';
import emailRoutes from './src/routes/email.routes';
import env from './src/config/env.config';

const app: Application = express();

// Middleware
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

const PORT = env.PORT;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));