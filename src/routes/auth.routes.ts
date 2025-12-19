import { Router } from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken';
import { register, login, logout, checkSession, refreshAccessToken } from '../controllers/auth.controller';

const router = Router();

// POST route to register a new user
// Body: { username, email, password, profileUrl? }
router.post('/register', register);

// POST route to login user
// Body: { email, password }
router.post('/login', login);

// POST route to logout user
// Requires: Authorization header with Bearer token (accessToken)
router.post('/logout', verifyAccessToken, logout);

// GET route to check user session
// Requires: Authorization header with Bearer token (accessToken)
router.get('/session', verifyAccessToken, checkSession);

// POST route to refresh access token
// Body: { refreshToken }
router.post('/refresh', refreshAccessToken);

export default router;