import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';

const router = Router();

// POST route to register a new user
// Body: { username, email, password, profileUrl? }
router.post('/register', register);

// POST route to login user
// Body: { email, password }
router.post('/login', login);

// POST route to logout user
// Body: { refreshToken }
router.post('/logout', logout);

export default router;