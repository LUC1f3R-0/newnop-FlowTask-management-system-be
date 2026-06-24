import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

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
      from: this.configService.getOrThrow<string>('SMTP_FROM'),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
