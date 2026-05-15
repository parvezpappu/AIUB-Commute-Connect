import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendVerificationOtp(email: string, fullName: string, otp: string) {
    return this.sendOtpEmail({
      email,
      fullName,
      otp,
      subject: 'Verify your AIUB Commute Connect account',
      heading: 'Verify your email',
      intro:
        'Use this one-time password to finish creating your AIUB Commute Connect account.',
      note: 'Use your name and university ID exactly as shown on your university ID card.',
      fallbackLabel: 'Email OTP',
    });
  }

  async sendPasswordResetOtp(email: string, fullName: string, otp: string) {
    return this.sendOtpEmail({
      email,
      fullName,
      otp,
      subject: 'Reset your AIUB Commute Connect password',
      heading: 'Reset your password',
      intro:
        'Use this one-time password to set a new password for your account.',
      note: 'If you did not request this password reset, you can safely ignore this email.',
      fallbackLabel: 'Password reset OTP',
    });
  }

  private async sendOtpEmail({
    email,
    fullName,
    otp,
    subject,
    heading,
    intro,
    note,
    fallbackLabel,
  }: {
    email: string;
    fullName: string;
    otp: string;
    subject: string;
    heading: string;
    intro: string;
    note: string;
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
      text: this.buildPlainTextEmail({ fullName, otp, intro, note }),
      html: this.buildHtmlEmail({ fullName, otp, heading, intro, note }),
    });
  }

  private buildPlainTextEmail({
    fullName,
    otp,
    intro,
    note,
  }: {
    fullName: string;
    otp: string;
    intro: string;
    note: string;
  }) {
    return [
      `Hello ${fullName},`,
      '',
      intro,
      '',
      `Your OTP is ${otp}. It will expire in 10 minutes.`,
      '',
      note,
      '',
      'AIUB Commute Connect',
    ].join('\n');
  }

  private buildHtmlEmail({
    fullName,
    otp,
    heading,
    intro,
    note,
  }: {
    fullName: string;
    otp: string;
    heading: string;
    intro: string;
    note: string;
  }) {
    const safeFullName = this.escapeHtml(fullName);
    const safeHeading = this.escapeHtml(heading);
    const safeIntro = this.escapeHtml(intro);
    const safeNote = this.escapeHtml(note);

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${safeHeading}</title>
        </head>
        <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dbe4f0;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="background:#003d73;padding:24px 28px;color:#ffffff;">
                      <div style="font-size:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">AIUB Commute Connect</div>
                      <h1 style="margin:12px 0 0;font-size:24px;line-height:1.25;">${safeHeading}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Hello ${safeFullName},</p>
                      <p style="margin:0 0 22px;font-size:16px;line-height:1.6;">${safeIntro}</p>
                      <div style="margin:0 0 22px;padding:18px 20px;background:#eef6ff;border:1px solid #b9daf8;border-radius:10px;text-align:center;">
                        <div style="font-size:13px;color:#52627a;margin-bottom:8px;">Your one-time password</div>
                        <div style="font-size:34px;line-height:1;font-weight:800;letter-spacing:8px;color:#003d73;">${otp}</div>
                      </div>
                      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#52627a;">This code will expire in 10 minutes.</p>
                      <p style="margin:0;padding:14px 16px;background:#fff8e6;border-left:4px solid #f2b705;border-radius:6px;font-size:14px;line-height:1.6;color:#5c4a12;">${safeNote}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 28px;background:#f8fafd;border-top:1px solid #e3eaf3;color:#6b7688;font-size:12px;line-height:1.5;">
                      This is an automated email from AIUB Commute Connect. Please do not reply to this message.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
