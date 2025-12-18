import nodemailer, { Transporter } from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from '../config/env.config';

/**
 * Email Service - Singleton pattern implementation
 * Ensures only one transporter instance exists across the entire application
 */
class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;
  private isInitialized: boolean = false;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  /**
   * Get the singleton instance of EmailService
   */
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Initialize and get the transporter instance
   * This ensures the transporter is only created once (lazy initialization)
   */
  public getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_PORT === 465, // true for 465, false for other ports
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      // Verify transporter connection (non-blocking)
      this.verifyConnection();
    }
    return this.transporter;
  }

  /**
   * Verify the transporter connection
   */
  private verifyConnection(): void {
    if (!this.transporter || this.isInitialized) return;

    this.transporter.verify((error) => {
      if (error) {
        console.error('Email transporter verification failed:', error);
      } else {
        console.log('Email transporter is ready to send messages');
        this.isInitialized = true;
      }
    });
  }
}

// Export singleton instance getter
const getEmailService = (): EmailService => EmailService.getInstance();

// Export the transporter for convenience (still a singleton)
export const emailTransporter: Transporter = getEmailService().getTransporter();

// Export the service instance for advanced usage
export const emailService = getEmailService();

export default emailTransporter;