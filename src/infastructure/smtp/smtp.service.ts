import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import { buildVerificationOtpMail } from './mails/verification-otp.mail.js';

@Injectable()
export class SmtpService {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('smtp.host'),
      port: Number(this.configService.getOrThrow<string>('smtp.port')),
      secure: this.configService.get<string>('smtp.secure') === 'true',
      auth: {
        user: this.configService.getOrThrow<string>('smtp.user'),
        pass: this.configService.getOrThrow<string>('smtp.password'),
      },
    });
  }

  async verifyConnection(): Promise<boolean> {
    await this.transporter.verify();
    return true;
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    return this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('smtp.user'),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  async sendVerificationOtp(options: { to: string; otp: string }) {
    const mail = buildVerificationOtpMail({
      otp: options.otp,
      expiresInMinutes: 10,
    });

    return this.sendMail({
      to: options.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
  }
}
