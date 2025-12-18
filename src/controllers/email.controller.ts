import { Request, Response } from 'express';
import { emailTransporter } from '../services/email.service';
import { EMAIL_FROM, EMAIL_USER } from '../config/env.config';
import { Email } from '../models/email.model';

interface EmailRequest {
  name: string;
  email: string;
  message: string;
}

export const sendEmail = async (req: Request, res: Response): Promise<Response> => {
  let emailRecord;
  const subject = `Message from ${req.body.name || 'User'}`;

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

    // Email options - Send to company email, from user's form submission
    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_USER, // Send to company email (codelikeba56@gmail.com)
      replyTo: email, // So company can reply directly to the user
      subject: `Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          </div>
          <h3 style="color: #333;">Message:</h3>
          <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            You can reply directly to this email to contact ${name} at ${email}
          </p>
        </div>
      `,
    };

    // Send email
    const info = await emailTransporter.sendMail(mailOptions);

    // Save email record to database with success status
    emailRecord = await Email.create({
      name,
      email,
      message,
      subject: `Contact Form: ${subject}`,
      from: EMAIL_FROM,
      to: EMAIL_USER, // Company email receives it
      messageId: info.messageId,
      status: 'sent',
    });

    return res.status(200).json({
      message: 'Email sent successfully',
      messageId: info.messageId,
      emailId: emailRecord._id,
    });
  } catch (error) {
    console.error('Error sending email:', error);

    // Save email record to database with failed status
    try {
      if (req.body.name && req.body.email && req.body.message) {
        emailRecord = await Email.create({
          name: req.body.name,
          email: req.body.email,
          message: req.body.message,
          subject: `Contact Form: ${subject}`,
          from: EMAIL_FROM,
          to: EMAIL_USER, // Company email
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } catch (dbError) {
      console.error('Error saving email record to database:', dbError);
    }

    return res.status(500).json({
      message: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
      emailId: emailRecord?._id,
    });
  }
};

