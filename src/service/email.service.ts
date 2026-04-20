import { transporter } from "@/config/nodemailer.config";

export class EmailService {
  static async sendVerificationEmail(to: string, token: string) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: "Zone <no-reply@zone.com>",
      to,
      subject: "Verify Your Email",
      html: `
        <p>Hi there,</p>
        <p>Thank you for registering! Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}
