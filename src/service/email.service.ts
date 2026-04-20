import { transporter } from "@/config/nodemailer.config";
import path from "path";
import pug from "pug";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EmailService {
  static async sendVerificationEmail(to: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const compiledFunction = pug.compileFile(
      path.join(__dirname, `../views/email-verification.pug`),
    );

    const html = compiledFunction({ verificationUrl });

    const mailOptions = {
      from: "Zone <no-reply@zone.com>",
      to,
      subject: "Verify Your Email",
      html,
    };

    await transporter.sendMail(mailOptions);
  }
}
