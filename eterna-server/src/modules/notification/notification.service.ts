import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Capsule } from '@/entities/capsule.entity';
import { ContactMethod } from '@/entities/capsule.enums';
import * as crypto from 'crypto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT');
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort) || 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('Email transporter initialized');
    } else {
      this.logger.warn('SMTP configuration not found, email notifications will be logged only');
    }
  }

  generateAccessUrl(capsuleId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const baseUrl = this.configService.get('APP_URL') || 'http://localhost:5173';
    return `${baseUrl}/capsule/view/${capsuleId}?token=${token}&expires=${expiresAt}`;
  }

  async sendNotification(capsule: Capsule): Promise<boolean> {
    if (!capsule.contactMethod || !capsule.contactValue) {
      this.logger.warn(`Capsule ${capsule.id} has no contact info`);
      return false;
    }

    const accessUrl = this.generateAccessUrl(capsule.id);

    switch (capsule.contactMethod) {
      case ContactMethod.EMAIL:
        return this.sendEmail(capsule, accessUrl);
      case ContactMethod.PHONE:
        return this.sendSms(capsule, accessUrl);
      case ContactMethod.QQ:
      case ContactMethod.WECHAT:
        this.logger.log(`QQ/WeChat notification for capsule ${capsule.id} - not implemented yet`);
        return false;
      default:
        this.logger.warn(`Unknown contact method: ${capsule.contactMethod}`);
        return false;
    }
  }

  private async sendEmail(capsule: Capsule, accessUrl: string): Promise<boolean> {
    const recipientName = capsule.recipientName || '亲爱的朋友';
    const senderName = capsule.user?.username || '一位朋友';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Noto Serif SC', serif;
            background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%);
            color: #ffffff;
            padding: 40px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255,255,255,0.05);
            border-radius: 20px;
            padding: 40px;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .title {
            font-size: 28px;
            color: #C1FF72;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 14px;
            color: rgba(255,255,255,0.5);
          }
          .content {
            line-height: 1.8;
            margin-bottom: 30px;
          }
          .message-box {
            background: rgba(193, 255, 114, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border-left: 3px solid #C1FF72;
          }
          .button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #C1FF72 0%, #00F2FF 100%);
            color: #0A0A0A;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: rgba(255,255,255,0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">🕊️ 守护兽来信</div>
            <div class="subtitle">永恒胶囊 · Eterna Capsule</div>
          </div>
          
          <div class="content">
            <p>亲爱的 <strong>${recipientName}</strong>：</p>
            
            <p>这是一封来自 <strong>${senderName}</strong> 的特别信件。</p>
            
            <div class="message-box">
              <p>守护兽已经完成了它的使命，现在将这份珍贵的记忆交给你。</p>
              <p>这是一份被封存的情感胶囊，包含了发送者想对你说的话。</p>
            </div>
            
            <p>请点击下方按钮查看完整内容：</p>
            
            <div style="text-align: center;">
              <a href="${accessUrl}" class="button">开启胶囊</a>
            </div>
            
            <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 20px;">
              此链接将在 7 天后失效
            </p>
          </div>
          
          <div class="footer">
            <p>永恒胶囊 · 守护你的数字记忆</p>
            <p>此邮件由系统自动发送，请勿回复</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
守护兽来信 - 永恒胶囊

亲爱的 ${recipientName}：

这是一封来自 ${senderName} 的特别信件。

守护兽已经完成了它的使命，现在将这份珍贵的记忆交给你。
这是一份被封存的情感胶囊，包含了发送者想对你说的话。

请点击以下链接查看完整内容：
${accessUrl}

（此链接将在 7 天后失效）

永恒胶囊 · 守护你的数字记忆
此邮件由系统自动发送，请勿回复
    `;

    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: `"永恒胶囊" <${this.configService.get('SMTP_USER')}>`,
          to: capsule.contactValue,
          subject: `🕊️ 守护兽来信 - ${senderName} 给你留下了一份记忆`,
          text: textContent,
          html: htmlContent,
        });
        this.logger.log(`Email sent to ${capsule.contactValue} for capsule ${capsule.id}`);
        return true;
      } else {
        this.logger.log(`[DEV] Would send email to ${capsule.contactValue}:`);
        this.logger.log(`Subject: 守护兽来信 - ${senderName} 给你留下了一份记忆`);
        this.logger.log(`Access URL: ${accessUrl}`);
        return true;
      }
    } catch (error) {
      this.logger.error(`Failed to send email for capsule ${capsule.id}: ${error.message}`);
      return false;
    }
  }

  private async sendSms(capsule: Capsule, accessUrl: string): Promise<boolean> {
    const recipientName = capsule.recipientName || '朋友';
    const senderName = capsule.user?.username || '一位朋友';
    
    const message = `【永恒胶囊】${recipientName}，${senderName}通过守护兽给你留下了一份记忆。点击查看：${accessUrl} 链接7天内有效。`;

    this.logger.log(`[DEV] Would send SMS to ${capsule.contactValue}:`);
    this.logger.log(message);
    
    return true;
  }
}
