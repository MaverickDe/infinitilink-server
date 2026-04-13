import nodemailer from "nodemailer"
import { config } from "../config"
import { OTPTYPE, production } from "../constant"
import { OtpService } from "./otp.service"

// Standardized constants for the new brand
const APP_NAME = "InfiniLink";
const PRIMARY_BLUE = "#2563eb";
const SLATE_900 = "#0f172a";
const SLATE_500 = "#64748b";
const BG_LIGHT = "#f8fafc";

/**
 * Email Service - InfiniLink Protocol
 * Handles secure communication nodes for verification and auth.
 */
export class EmailService {
  private static getTransporter() {
    if (config.emailService === "gmail") {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.emailUser,
          pass: config.emailPass,
        },
      })
    }

    return nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: config.emailSecure,
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    })
  }

  /**
   * Helper to wrap content in the InfiniLink "High-Fidelity" HTML Template
   */
  private static wrapTemplate(content: string, previewText: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .body-wrap { 
              background-color: ${BG_LIGHT}; 
              font-family: 'Inter', Helvetica, Arial, sans-serif; 
              padding: 48px 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff; 
              border-radius: 24px; 
              overflow: hidden; 
              border: 1px solid #e2e8f0;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
            }
            .header { padding: 40px; text-align: center; background-color: white; }
            .content { padding: 0 40px 40px 40px; text-align: left; }
            .footer { padding: 32px; background-color: ${SLATE_900}; text-align: center; }
            .otp-box { 
              background-color: ${BG_LIGHT}; 
              border: 2px dashed #cbd5e1; 
              border-radius: 16px; 
              padding: 24px; 
              font-size: 32px; 
              text-align: center; 
              letter-spacing: 8px; 
              font-weight: 900; 
              color: ${PRIMARY_BLUE};
              margin: 24px 0;
            }
            .label { 
              font-size: 10px; 
              font-weight: 900; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
              color: ${SLATE_500}; 
              margin-bottom: 8px;
            }
            .title { 
              font-size: 28px; 
              font-weight: 900; 
              color: ${SLATE_900}; 
              letter-spacing: -1px; 
              margin-bottom: 16px; 
            }
            .text { color: ${SLATE_500}; font-size: 15px; line-height: 1.6; }
          </style>
        </head>
        <body class="body-wrap">
          <div class="container">
            <div class="header">
              <div style="font-weight: 900; font-size: 20px; text-transform: uppercase; letter-spacing: -1px; font-style: italic;">
                ${APP_NAME}<span style="color: ${PRIMARY_BLUE}">.</span>
              </div>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p style="color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                Standardized Infrastructure for Modern Web Curators
              </p>
              <p style="color: #475569; font-size: 9px; font-weight: 600; margin-top: 16px;">
                &copy; ${new Date().getFullYear()} ${APP_NAME} Protocol. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static async sendVerificationEmail(email: string): Promise<string> {
    try {

      if(production){
       return await ResendEmailService.sendVerificationEmail(email)
      }
      const otp = await OtpService.generateOtp({ email, type: OTPTYPE.emailVerification });
      
      const html = this.wrapTemplate(`
        <div class="label">System_Access_Verification</div>
        <h1 class="title">Verify Your <br/> <span style="color: ${PRIMARY_BLUE}; font-style: italic;">Identity.</span></h1>
        <p class="text">Initialize your vault access by entering the secure dispatch code below. This node verification expires in 10 minutes.</p>
        <div class="otp-box">${otp}</div>
        <p class="text" style="font-size: 12px;">If you did not request this verification, please disregard this payload.</p>
      `, "Verify your InfiniLink email address");

      const mailOptions = {
        from: `"${APP_NAME} Dispatch" <${config.emailFrom}>`,
        to: email,
        subject: `[ACTION REQUIRED] Verify Identity - ${APP_NAME}`,
        html,
      }

      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      return otp;
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  static async sendForgotPasswordEmail(email: string): Promise<string> {
    try {
           if(production){
       return await ResendEmailService.sendForgotPasswordEmail(email)
      }
      const otp = await OtpService.generateOtp({ email, type: OTPTYPE.forgotPassword });

      const html = this.wrapTemplate(`
        <div class="label">Security_Protocol_Override</div>
        <h1 class="title">Reset Your <br/> <span style="color: ${PRIMARY_BLUE}; font-style: italic;">Access Key.</span></h1>
        <p class="text">A request was made to override your current credentials. Use the following payload to re-initialize your password.</p>
        <div class="otp-box">${otp}</div>
        <p class="text" style="font-size: 12px; color: #ef4444;">Warning: If you did not initiate this override, secure your account immediately.</p>
      `, "Password Reset Payload for InfiniLink");

      const mailOptions = {
        from: `"${APP_NAME} Security" <${config.emailFrom}>`,
        to: email,
        subject: `[SECURITY] Access Key Reset - ${APP_NAME}`,
        html,
      }

      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      return otp;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const html = this.wrapTemplate(`
        <div class="label">Onboarding_Complete</div>
        <h1 class="title">Welcome to the <br/> <span style="color: ${PRIMARY_BLUE}; font-style: italic;">Infrastructure.</span></h1>
        <p class="text">Hello ${name.toUpperCase()}, your identity has been verified. Your vault is now ready to curate your digital footprint.</p>
        <div style="margin-top: 32px; padding: 20px; background-color: ${BG_LIGHT}; border-radius: 12px;">
          <p style="margin: 0; font-size: 11px; font-weight: 900; color: ${SLATE_900}; text-transform: uppercase; letter-spacing: 1px;">Capabilities_Enabled:</p>
          <ul style="padding-left: 20px; color: ${SLATE_500}; font-size: 13px; margin-top: 10px;">
            <li>Secure Link Node Management</li>
            <li>Recursive Organization Hierarchy</li>
            <li>Zero-Trust Data Protection</li>
          </ul>
        </div>
      `, `Welcome to ${APP_NAME}, ${name}`);

      const mailOptions = {
        from: `"${APP_NAME} Concierge" <${config.emailFrom}>`,
        to: email,
        subject: `Welcome to ${APP_NAME} - Identity Verified`,
        html,
      }

      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  }
}

import { Resend } from "resend";

export class ResendEmailService {
  private static resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

  /**
   * Wrap content in your HTML template
   */
  private static wrapTemplate(content: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .body-wrap { 
              background-color: ${BG_LIGHT}; 
              font-family: 'Inter', Helvetica, Arial, sans-serif; 
              padding: 48px 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff; 
              border-radius: 24px; 
              overflow: hidden; 
              border: 1px solid #e2e8f0;
            }
            .header { padding: 40px; text-align: center; }
            .content { padding: 0 40px 40px 40px; }
            .footer { padding: 32px; background-color: ${SLATE_900}; text-align: center; }
            .otp-box { 
              background-color: ${BG_LIGHT}; 
              border: 2px dashed #cbd5e1; 
              border-radius: 16px; 
              padding: 24px; 
              font-size: 32px; 
              text-align: center; 
              letter-spacing: 8px; 
              font-weight: 900; 
              color: ${PRIMARY_BLUE};
              margin: 24px 0;
            }
            .title { 
              font-size: 28px; 
              font-weight: 900; 
              color: ${SLATE_900}; 
              margin-bottom: 16px; 
            }
            .text { color: ${SLATE_500}; font-size: 15px; }
          </style>
        </head>
        <body class="body-wrap">
          <div class="container">
            <div class="header">
              <strong>${APP_NAME}</strong>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p style="color:#64748b;font-size:10px;">
                © ${new Date().getFullYear()} ${APP_NAME}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // 🔐 VERIFY EMAIL
  static async sendVerificationEmail(email: string): Promise<string> {
    try {
      const otp = await OtpService.generateOtp({
        email,
        type: OTPTYPE.emailVerification,
      });

      const html = this.wrapTemplate(`
        <h1 class="title">Verify Your Identity</h1>
        <p class="text">Use the code below:</p>
        <div class="otp-box">${otp}</div>
      `);

      await this.resend.emails.send({
        from: `${APP_NAME} <onboarding@resend.dev>`, // change later
        to: email,
        subject: "Verify your email",
        html,
      });

      return otp;
    } catch (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send verification email");
    }
  }

  // 🔑 FORGOT PASSWORD
  static async sendForgotPasswordEmail(email: string): Promise<string> {
    try {
      const otp = await OtpService.generateOtp({
        email,
        type: OTPTYPE.forgotPassword,
      });

      const html = this.wrapTemplate(`
        <h1 class="title">Reset Your Password</h1>
        <p class="text">Use this code:</p>
        <div class="otp-box">${otp}</div>
      `);

      await this.resend.emails.send({
        from: `${APP_NAME} <onboarding@resend.dev>`,
        to: email,
        subject: "Password reset",
        html,
      });

      return otp;
    } catch (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  // 🎉 WELCOME EMAIL
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const html = this.wrapTemplate(`
        <h1 class="title">Welcome ${name}</h1>
        <p class="text">Your account is ready 🚀</p>
      `);

      await this.resend.emails.send({
        from: `${APP_NAME} <onboarding@resend.dev>`,
        to: email,
        subject: "Welcome!",
        html,
      });
    } catch (error) {
      console.error("Resend error:", error);
    }
  }
}