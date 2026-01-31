"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = require("../config/nodemailer");
class EmailService {
    static async getTemplate(templateName, placeholders) {
        const filePath = path_1.default.join(__dirname, `../templates/${templateName}.html`);
        let html = fs_1.default.readFileSync(filePath, 'utf8');
        Object.keys(placeholders).forEach(key => {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), placeholders[key]);
        });
        return html;
    }
    static async sendWelcomeEmail(user) {
        try {
            const html = await this.getTemplate('welcome', { name: user.name });
            await nodemailer_1.transporter.sendMail({
                from: '"E-shop Admin" <noreply@eshop.com>',
                to: user.email,
                subject: 'Welcome to E-shop!',
                html,
            });
        }
        catch (err) {
            console.error('Email sending failed:', err);
        }
    }
    static async sendPasswordResetEmail(user, resetURL) {
        try {
            await nodemailer_1.transporter.sendMail({
                from: '"E-shop Admin" <noreply@eshop.com>',
                to: user.email,
                subject: 'Your password reset token (valid for 10 min)',
                text: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`
            });
        }
        catch (err) {
            console.error('Password reset email failed:', err);
        }
    }
}
exports.EmailService = EmailService;
// ...
