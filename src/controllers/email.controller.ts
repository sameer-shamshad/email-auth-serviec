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

    return res.status(200).json({ message: 'Email sent successfully' });
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

    return res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * Get paginated list of emails
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - status: Filter by status ('sent' | 'failed')
 * - email: Filter by sender email
 */
export const getEmails = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 per page
    const status = req.query.status as string | undefined;
    const emailFilter = req.query.email as string | undefined;

    // Build filter object
    const filter: any = {};
    if (status && (status === 'sent' || status === 'failed')) {
      filter.status = status;
    }
    if (emailFilter) {
      filter.email = { $regex: emailFilter, $options: 'i' }; // Case-insensitive search
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch emails with pagination (sorted by newest first)
    const [emails, totalCount] = await Promise.all([
      Email.find(filter)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .select('-__v') // Exclude version key
        .lean(), // Return plain JavaScript objects
      Email.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      emails,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

