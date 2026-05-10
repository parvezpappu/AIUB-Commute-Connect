import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendVerificationOtp(email: string, fullName: string, otp: string) {
    return this.sendOtpEmail({
      email,
      fullName,
      otp,
      subject: 'AIUB Commute Connect email verification OTP',
      text: `Hello ${fullName},\n\nYour AIUB Commute Connect verification OTP is ${otp}. It will expire in 10 minutes.\n\nUse your name and student ID exactly as shown on your university ID card.`,
      fallbackLabel: 'Email OTP',
    });
  }

  async sendPasswordResetOtp(email: string, fullName: string, otp: string) {
    return this.sendOtpEmail({
      email,
      fullName,
      otp,
      subject: 'AIUB Commute Connect password reset OTP',
      text: `Hello ${fullName},\n\nYour AIUB Commute Connect password reset OTP is ${otp}. It will expire in 10 minutes.\n\nIf you did not request this, you can ignore this email.`,
      fallbackLabel: 'Password reset OTP',
    });
  }

  private async sendOtpEmail({
    email,
    fullName,
    otp,
    subject,
    text,
    fallbackLabel,
  }: {
    email: string;
    fullName: string;
    otp: string;
    subject: string;
    text: string;
    fallbackLabel: string;
  }) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM ?? user;

    if (!host || !user || !pass || !from) {
      console.log(
        `${fallbackLabel} for ${email} (${fullName}): ${otp}. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM to send real email.`,
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
      subject,
      text,
    });
  }
}
