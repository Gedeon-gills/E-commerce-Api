import nodemailer from 'nodemailer';
import { env } from './env';

export const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT),
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Email Service Error:', error);
  } else {
    console.log('✅ Email Service Ready');
  }
});
