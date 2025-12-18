import { Request, Response } from 'express';
import { emailTransporter } from '../services/email.service';
import { EMAIL_FROM } from '../config/env.config';

interface EmailRequest {
  name: string;
  email: string;
  message: string;
}

export const sendEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, message }: EmailRequest = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        message: 'Missing required fields: name, email, and message are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Email options
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: `Message from ${name}`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Message from ${name}</h2>
          <p style="color: #666; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This email was sent from: ${email}</p>
        </div>
      `,
    };

    // Send email
    const info = await emailTransporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

