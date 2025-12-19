import { Router } from 'express';
import { sendEmail, getEmails } from '../controllers/email.controller';

const router = Router();

// POST route to send email
// Accepts: name, email, message in request body
router.post('/send', sendEmail);

// GET route to fetch emails with pagination
// Query params: ?page=1&limit=50&status=sent&email=example@email.com
router.get('/', getEmails);

export default router;