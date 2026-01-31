import fs from 'fs';
import path from 'path';
import { transporter } from '../config/nodemailer';

export class EmailService {
  private static async getTemplate(templateName: string, placeholders: Record<string, string>) {
    const filePath = path.join(__dirname, `../templates/${templateName}.html`);
    let html = fs.readFileSync(filePath, 'utf8');
    Object.keys(placeholders).forEach(key => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), placeholders[key]);
    });
    return html;
  }

  static async sendWelcomeEmail(user: { email: string; name: string }) {
    try {
        const html = await this.getTemplate('welcome', { name: user.name });
        await transporter.sendMail({
          from: '"E-shop Admin" <noreply@eshop.com>',
          to: user.email,
          subject: 'Welcome to E-shop!',
          html,
        });
    } catch (err) {
        console.error('Email sending failed:', err);
    }
  }

  static async sendPasswordResetEmail(user: any, resetURL: string) {
    try {
      await transporter.sendMail({
        from: '"E-shop Admin" <noreply@eshop.com>',
        to: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        text: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`
      });
    } catch (err) {
      console.error('Password reset email failed:', err);
    }
  }
}
// ...