import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Users } from '@prisma/client';
import { Transporter } from 'nodemailer';
import { renderToStaticMarkup } from 'react-dom/server';
import ResetPasswordEmail from 'src/config/email_pwd.template';
import WelcomeEmail from 'src/config/email_template';
import { OrderEmailTemplateDto } from 'src/config/order-templates/dto/order-email-template-dto';
import { OrderProcessing } from 'src/config/order-templates/order-processing-template';

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
    @Inject('NODEMAILER') private readonly transporter: Transporter,
  ) {}
  async sendEmailVerify({
    to,
    subject,
    userFirstname,
    url,
  }: {
    to: string;
    subject: string;
    userFirstname: string;
    url: string;
  }) {
    const emailHtml = renderToStaticMarkup(
      <WelcomeEmail url={url} userFirstname={userFirstname} />,
    );
    const mailOptions = {
      from: this.configService.get<string>('smtp_user'),
      to,
      subject,
      html: emailHtml,
    };
    await this.transporter.sendMail(mailOptions);
  }
  async sendEmailForgotPwd({
    to,
    subject,
    userFirstname,
    url,
    urlRedirectWithCode,
    code,
  }: {
    to: string;
    subject: string;
    userFirstname: string;
    url: string;
    code: string;
    urlRedirectWithCode: string;
  }) {
    const emailHtml = renderToStaticMarkup(
      <ResetPasswordEmail
        url={url}
        code={code}
        userFirstname={userFirstname}
        urlRedirectWithCode={urlRedirectWithCode}
      />,
    );
    const mailOptions = {
      from: this.configService.get<string>('smtp_user'),
      to,
      subject,
      html: emailHtml,
    };
    await this.transporter.sendMail(mailOptions);
  }
  async sendOrderProcessing({
    order,
    user,
  }: {
    order: OrderEmailTemplateDto;
    user: Users;
  }) {
    const emailHtml = renderToStaticMarkup(
      <OrderProcessing order={order} userName={user.full_name} />,
    );
    const mailOptions = {
      from: this.configService.get<string>('smtp_user'),
      to: user.email,
      subject: 'Order Processing',
      html: emailHtml,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
