import { Router } from 'express';
import { sendEmail } from '../controllers/email.controller';

const router = Router();

// POST route to send email
// Accepts: name, email, message in request body
router.post('/send', sendEmail);

export default router;