import { Router } from 'express';
import { register } from '../controllers/auth.controller';

const router = Router();

// POST route to register a new user
// Body: { username, email, profileUrl? }
router.post('/register', register);

export default router;