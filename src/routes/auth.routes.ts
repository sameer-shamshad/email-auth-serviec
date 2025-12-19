import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// POST route to register a new user
// Body: { username, email, profileUrl? }
router.post('/register', register);

// POST route to login user
// Body: { email, password }
router.post('/login', login);

export default router;