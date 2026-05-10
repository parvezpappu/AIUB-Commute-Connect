import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendVerificationOtp(email: string, fullName: string, otp: string) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM ?? user;

    if (!host || !user || !pass || !from) {
      console.log(
        `Email OTP for ${email} (${fullName}): ${otp}. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM to send real email.`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'AIUB Commute Connect email verification OTP',
      text: `Hello ${fullName},\n\nYour AIUB Commute Connect verification OTP is ${otp}. It will expire in 10 minutes.\n\nUse your name and student ID exactly as shown on your university ID card.`,
    });
  }
}
