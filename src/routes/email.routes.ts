import { Router } from 'express';
import { sendEmail, getEmails } from '../controllers/email.controller';
import { verifyAccessToken } from '../middlewares/verifyToken';
import { verifyAdmin } from '../middlewares/verifyAdmin';

const router = Router();

// POST route to send email
// Accepts: name, email, message in request body
router.post('/send', sendEmail);

// GET route to fetch emails with pagination (Admin only)
// Query params: ?page=1&limit=50&status=sent&email=example@email.com
// Requires: Authorization header with Bearer token (accessToken) and admin role
router.get('/', verifyAccessToken, verifyAdmin, getEmails);

export default router;