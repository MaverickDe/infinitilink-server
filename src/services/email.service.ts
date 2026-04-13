import nodemailer from "nodemailer";
import axios from "axios";
import { Resend } from "resend";

import { config } from "../config";
import { EMAIL_DRIVER, OTPTYPE } from "../constant";
import { OtpService } from "./otp.service";
import {
  APP_NAME,
  verificationEmailTemplate,
  forgotPasswordEmailTemplate,
  welcomeEmailTemplate,
} from "../mail/templates";

// ─── Shared OTP helper ───────────────────────────────────────────────────────

async function generateOtp(email: string, type: OTPTYPE): Promise<string> {
  return OtpService.generateOtp({ email, type });
}

// ─── 1. EmailService — nodemailer (direct SMTP / Gmail) ──────────────────────

export class EmailService {
  private static getTransporter() {
    if (config.emailService === "gmail") {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user: config.emailUser, pass: config.emailPass },
      });
    }
    return nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: config.emailSecure,
      auth: { user: config.emailUser, pass: config.emailPass },
    });
  }

  private static async send(to: string, subject: string, html: string) {
    const transporter = this.getTransporter();
    await transporter.sendMail({
      from: `"${APP_NAME}" <${config.emailFrom}>`,
      to,
      subject,
      html,
    });
  }

  static async sendVerificationEmail(email: string): Promise<string> {
    const otp = await generateOtp(email, OTPTYPE.emailVerification);
    await this.send(
      email,
      `[ACTION REQUIRED] Verify Identity — ${APP_NAME}`,
      verificationEmailTemplate(otp)
    );
    return otp;
  }

  static async sendForgotPasswordEmail(email: string): Promise<string> {
    const otp = await generateOtp(email, OTPTYPE.forgotPassword);
    await this.send(
      email,
      `[SECURITY] Access Key Reset — ${APP_NAME}`,
      forgotPasswordEmailTemplate(otp)
    );
    return otp;
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.send(
      email,
      `Welcome to ${APP_NAME} — Identity Verified`,
      welcomeEmailTemplate(name)
    );
  }
}

// ─── 2. ResendEmailService — Resend SDK ──────────────────────────────────────

export class ResendEmailService {
  private static resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
  private static from = `${APP_NAME} <onboarding@resend.dev>`;

  private static async send(to: string, subject: string, html: string) {
    await this.resend.emails.send({ from: this.from, to, subject, html });
  }

  static async sendVerificationEmail(email: string): Promise<string> {
    const otp = await generateOtp(email, OTPTYPE.emailVerification);
    await this.send(email, "Verify your email", verificationEmailTemplate(otp));
    return otp;
  }

  static async sendForgotPasswordEmail(email: string): Promise<string> {
    const otp = await generateOtp(email, OTPTYPE.forgotPassword);
    await this.send(email, "Password reset", forgotPasswordEmailTemplate(otp));
    return otp;
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.send(email, "Welcome!", welcomeEmailTemplate(name));
  }
}

// ─── 3. CustomEmailService — nodemailer payload → VPS via axios ──────────────
//
//  Your VPS endpoint should accept POST /domain/send/custom-mail with body:
//  { from, to, subject, html }
//  and forward it through its own nodemailer instance.

export class CustomEmailService {
  private static vpsUrl =
    // process.env.VPS_MAIL_URL ?? "http://91.108.121.30:5000/send/custom-mail";
    process.env.VPS_MAIL_URL ?? "https://shabeetask.com/api/send/custom-mail";

  private static async send(to: string, subject: string, html: string) {
    await axios.post(this.vpsUrl, {
      from: `"${APP_NAME}" <${config.emailFrom}>`,
      email:to,
      subject,
      text:subject,
      html,
    });
  }

  static async sendVerificationEmail(email: string): Promise<string> {
    const otp = await generateOtp(email, OTPTYPE.emailVerification);
    await this.send(
      email,
      `[ACTION REQUIRED] Verify Identity — ${APP_NAME}`,
      verificationEmailTemplate(otp)
    );
    return otp;
  }

  static async sendForgotPasswordEmail(email: string): Promise<string> {
    const otp = await generateOtp(email, OTPTYPE.forgotPassword);
    await this.send(
      email,
      `[SECURITY] Access Key Reset — ${APP_NAME}`,
      forgotPasswordEmailTemplate(otp)
    );
    return otp;
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.send(
      email,
      `Welcome to ${APP_NAME} — Identity Verified`,
      welcomeEmailTemplate(name)
    );
  }
}

// ─── Unified factory ─────────────────────────────────────────────────────────
//
//  Set EMAIL_DRIVER in your environment:
//    "resend"  → ResendEmailService
//    "custom"  → CustomEmailService  (VPS / Render nodemailer)
//    anything else (default) → EmailService (direct SMTP)
//
//  Usage:
//    import { mailer } from "./email.service";
//    await mailer.sendVerificationEmail("user@example.com");

type MailDriver = typeof EmailService | typeof ResendEmailService | typeof CustomEmailService;

function resolveMailer(): MailDriver {
  const driver = EMAIL_DRIVER?.toLowerCase();
  if (driver === "resend") return ResendEmailService;
  if (driver === "custom") return CustomEmailService;
  return EmailService;
}

export const mailer = resolveMailer();