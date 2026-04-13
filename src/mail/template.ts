import nodemailer from "nodemailer"
import { DOMAIN, OTPTYPE } from "../constant"
// import { OtpService } from "../otp/service"
import { config } from "../config"
import { OtpService } from "../services/otp.service"

// Create reusable transporter
export const APPNAME = "Xavren"
const createTransporter = () => {
  // For Gmail
  if (config.emailService === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    })
  }

  // For other SMTP services
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

// export class MailTemplate {
//   static async sendVerificationEmail(email: string) {
//     try {
//       const otp = await OtpService.generateOtp({ email, type: OTPTYPE.emailVerification })

//       const mailOptions = {
//         from: `"${APPNAME} App" <${config.emailFrom || config.emailUser}>`,
//         to: email,
//         subject: "Your OTP for Email Verification",
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//             <div style="text-align: center; margin-bottom: 20px;">
//               <h1 style="color: #333;">BUCX</h1>
//               <p style="color: #666;">BORDERLESS BANKING EXPERIENCE</p>
//             </div>
//             <h2 style="color: #333;">Verify Your Email</h2>
//             <p>Thank you for signing up. To complete your registration, please use the following verification code:</p>
//             <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
//               ${otp}
//             </div>
//             <p style="margin-top: 20px; font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
//             <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn't request this verification, please ignore this email.</p>
//           </div>
//         `,
//       }

//       const transporter = createTransporter()
//       await transporter.sendMail(mailOptions)
//       console.log(`Verification email sent to ${email}`)

//       return otp
//     } catch (error) {
//       console.error("Failed to send verification email:", error)
//       throw new Error("Failed to send verification email")
//     }
//   }

//   static async sendForgotPasswordEmail(email: string) {
//     try {
//       const otp = await OtpService.generateOtp({ email, type: OTPTYPE.forgotPassword })

//       const mailOptions = {
//         from: `"${APPNAME} App" <${config.emailFrom || config.emailUser}>`,
//         to: email,
//         subject: "Password Reset Request",
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//             <div style="text-align: center; margin-bottom: 20px;">
//               <h1 style="color: #333;">BUCX</h1>
//               <p style="color: #666;">BORDERLESS BANKING EXPERIENCE</p>
//             </div>
//             <h2 style="color: #333;">Reset Your Password</h2>
//             <p>We received a request to reset your password. Please use the following code to reset your password:</p>
//             <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
//               ${otp}
//             </div>
//             <p style="margin-top: 20px; font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
//             <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
//           </div>
//         `,
//       }

//       const transporter = createTransporter()
//       await transporter.sendMail(mailOptions)
//       console.log(`Password reset email sent to ${email}`)

//       return otp
//     } catch (error) {
//       console.error("Failed to send password reset email:", error)
//       throw new Error("Failed to send password reset email")
//     }
//   }

//   static async sendWelcomeEmail(email: string, name: string) {
//     try {
//       const mailOptions = {
//         from: `"${APPNAME} App" <${config.emailFrom || config.emailUser}>`,
//         to: email,
//         subject: `Welcome to ${APPNAME}!`,
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//             <div style="text-align: center; margin-bottom: 20px;">
//               <h1 style="color: #333;">${APPNAME}</h1>
//               <p style="color: #666;">BORDERLESS BANKING EXPERIENCE</p>
//             </div>
//             <h2 style="color: #333;">Welcome, ${name}!</h2>
//             <p>Thank you for joining ${APPNAME}. Your account has been successfully verified and is now ready to use.</p>
//             <p>With ${APPNAME}, you can:</p>
//             <ul style="margin-top: 20px; margin-bottom: 20px;">
//               <li>Manage your digital assets securely</li>
//               <li>Send and receive payments</li>
//               <li>Access exclusive features and services</li>
//             </ul>
//             <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
//           </div>
//         `,
//       }

//       const transporter = createTransporter()
//       await transporter.sendMail(mailOptions)
//       console.log(`Welcome email sent to ${email}`)
//     } catch (error) {
//       console.error("Failed to send welcome email:", error)
//       // Don't throw here as this is not critical for the user flow
//     }
//   }
// }



export class MailTemplate {
  // Base email template with gradient theme
  static getBaseTemplate(content: string) {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${APPNAME}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px;">SEAMLESS ENV SYNC EXPERIENCE</p>
          </div>
          
          <!-- Content -->
          <div style="background: white; padding: 40px 30px;">
            ${content}
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;">
              © ${new Date().getFullYear()} ${APPNAME}. All rights reserved.
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; text-align: center;">
              If you have any questions, contact us at support@${APPNAME.toLowerCase()}.com
            </p>
          </div>
        </div>
      </div>
    `;
  }

  static async sendVerificationEmail(email: string) {
    try {
      const otp = await OtpService.generateOtp({ email, type: OTPTYPE.emailVerification });

      const content = `
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email</h2>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
          Thank you for signing up! To complete your registration and secure your account, please use the following verification code:
        </p>
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; display: inline-block;">
            <span style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </span>
          </div>
        </div>
        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            ⏰ <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
          </p>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          If you didn't create an account with us, please ignore this email or contact our support team if you have concerns.
        </p>
      `;

      const mailOptions = {
        from: config.emailFrom,
        to: email,
        subject: "🔐 Verify Your Email Address",
        html: this.getBaseTemplate(content),
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);

      return otp;
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  static async sendForgotPasswordEmail(email: string) {
    try {
      const otp = await OtpService.generateOtp({ email, type: OTPTYPE.forgotPassword });

      const content = `
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
          We received a request to reset your password. Use the secure code below to create a new password for your account:
        </p>
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; display: inline-block;">
            <span style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </span>
          </div>
        </div>
        <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #991b1b;">
            🔒 <strong>Security Notice:</strong> This code expires in 10 minutes. Never share it with anyone.
          </p>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          If you didn't request a password reset, please ignore this email. Your account remains secure and no changes have been made.
        </p>
      `;

      const mailOptions = {
           from: config.emailFrom,
        to: email,
        subject: "🔐 Password Reset Request",
        html: this.getBaseTemplate(content),
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);

      return otp;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  static async sendWelcomeEmail(email: string, name: string) {
    try {
      const content = `
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Welcome to the Future of Banking, ${name}! 🎉</h2>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
          Congratulations! Your ${APPNAME} account has been successfully verified and is now ready to transform your banking experience.
        </p>
        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="color: #8b5cf6; margin: 0 0 15px 0; font-size: 18px;">🚀 What you can do now:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">💼 Manage your digital assets with bank-level security</li>
            <li style="margin-bottom: 8px;">⚡ Send and receive instant payments globally</li>
            <li style="margin-bottom: 8px;">📊 Access advanced analytics and insights</li>
            <li style="margin-bottom: 8px;">🔐 Enjoy enterprise-grade security features</li>
            <li>🌍 Experience true Env Syncing</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
            Get Started Now →
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #64748b; text-align: center;">
          Need help getting started? Our support team is here 24/7 to assist you.
        </p>
      `;

      const mailOptions = {
        from: `"${APPNAME} Team" <${config.emailFrom || config.emailUser}>`,
        to: email,
        subject: `🎉 Welcome to ${APPNAME} - Your Journey Begins Now!`,
        html: this.getBaseTemplate(content),
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't throw here as this is not critical for the user flow
    }
  }

  static async sendTeamInviteEmail(inviteEmail: string, inviterName: string, projectName: string, role: string, projectId: string) {
    try {
      const inviteUrl = `${DOMAIN}/dashboard/projects/${projectId}/invite`;

      const content = `
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">You're Invited to Collaborate! 🤝</h2>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
          <strong>${inviterName}</strong> has invited you to join their team on <strong>${projectName}</strong>.
        </p>
        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 25px; margin: 25px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="flex: 1;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">PROJECT</p>
              <p style="margin: 0; color: #1e293b; font-weight: bold;">${projectName}</p>
            </div>
            <div style="flex: 1;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">YOUR ROLE</p>
              <span style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                ${role}
              </span>
            </div>
          </div>
          <p style="margin: 15px 0 0 0; font-size: 14px; color: #64748b;">
            👤 <strong>Invited by:</strong> ${inviterName}
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); margin-right: 10px;">
            Accept Invitation 🎉
          </a>
          <a href="${inviteUrl}" style="background: transparent; color: #64748b; padding: 15px 30px; border: 2px solid #e2e8f0; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            View Details
          </a>
        </div>
        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            ⏰ <strong>Note:</strong> This invitation will expire in 7 days. Accept soon to start collaborating!
          </p>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          If you don't recognize the sender or project, you can safely ignore this email.
        </p>
      `;

      const mailOptions = {
        from: config.emailFrom ,
        to: inviteEmail,
        subject: `🤝 You're invited to collaborate on ${projectName}`,
        html: this.getBaseTemplate(content),
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`Team invite email sent to ${inviteEmail}`);
    } catch (error) {
      console.error("Failed to send team invite email:", error);
      throw new Error("Failed to send team invite email");
    }
  }

  static async sendLoginNotificationEmail(email: string, name: string, loginDetails: { device: string, location: string, ip: string, timestamp: Date }) {
    try {
      const formattedTime = loginDetails.timestamp.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      const content = `
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">New Login Detected 🔐</h2>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
          Hello ${name}, we detected a new login to your ${APPNAME} account. Here are the details:
        </p>
        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 25px; margin: 25px 0;">
          <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">🕒 WHEN</p>
            <p style="margin: 0; color: #1e293b; font-weight: bold;">${formattedTime}</p>
          </div>
          <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">📱 DEVICE</p>
            <p style="margin: 0; color: #1e293b;">${loginDetails.device}</p>
          </div>
          <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">🌍 LOCATION</p>
            <p style="margin: 0; color: #1e293b;">${loginDetails.location}</p>
          </div>
          <div>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">🔢 IP ADDRESS</p>
            <p style="margin: 0; color: #1e293b; font-family: 'Courier New', monospace;">${loginDetails.ip}</p>
          </div>
        </div>
        <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #166534;">
            ✅ <strong>Was this you?</strong> If yes, no action needed. Your account is secure.
          </p>
        </div>
        <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #991b1b;">
            ⚠️ <strong>Don't recognize this activity?</strong>
          </p>
          <p style="margin: 0; font-size: 14px; color: #991b1b;">
            Secure your account immediately by changing your password and enabling two-factor authentication.
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); margin-right: 10px;">
            Secure My Account
          </a>
          <a href="#" style="background: transparent; color: #64748b; padding: 15px 30px; border: 2px solid #e2e8f0; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            View Activity
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          We send these notifications to help keep your account secure. You can manage your notification preferences in your account settings.
        </p>
      `;

      const mailOptions = {
    from: config.emailFrom,
        to: email,
        subject: `🔐 New login to your ${APPNAME} account`,
        html: this.getBaseTemplate(content),
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`Login notification email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send login notification email:", error);
      // Don't throw here as this is not critical for the user flow
    }
  }

  static async sendPasswordChangedEmail(email: string, name: string, changeDetails: { device: string, location: string, ip: string, timestamp: Date }) {
    try {
      const formattedTime = changeDetails.timestamp.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      const content = `
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Password Changed Successfully 🔐</h2>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
          Hello ${name}, your ${APPNAME} account password was recently changed. Here are the details:
        </p>
        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 25px; margin: 25px 0;">
          <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">🕒 WHEN</p>
            <p style="margin: 0; color: #1e293b; font-weight: bold;">${formattedTime}</p>
          </div>
          <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">📱 DEVICE</p>
            <p style="margin: 0; color: #1e293b;">${changeDetails.device}</p>
          </div>
          <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">🌍 LOCATION</p>
            <p style="margin: 0; color: #1e293b;">${changeDetails.location}</p>
          </div>
          <div>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">🔢 IP ADDRESS</p>
            <p style="margin: 0; color: #1e293b; font-family: 'Courier New', monospace;">${changeDetails.ip}</p>
          </div>
        </div>
        <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #166534;">
            ✅ <strong>Account Secured:</strong> Your new password is now active and your account is secure.
          </p>
        </div>
        <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #991b1b;">
            ⚠️ <strong>Didn't change your password?</strong>
          </p>
          <p style="margin: 0; font-size: 14px; color: #991b1b;">
            Your account may be compromised. Contact our security team immediately and change your password again.
          </p>
        </div>
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #0369a1;">
            🛡️ <strong>Security Tips:</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #0369a1; font-size: 14px;">
            <li>Use a unique, strong password</li>
            <li>Enable two-factor authentication</li>
            <li>Never share your password with anyone</li>
            <li>Log out from public devices</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); margin-right: 10px;">
            Review Security Settings
          </a>
          <a href="#" style="background: transparent; color: #64748b; padding: 15px 30px; border: 2px solid #e2e8f0; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Contact Support
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          This is an automated security notification. We send these alerts to help protect your account.
        </p>
      `;

      const mailOptions = {
    from: config.emailFrom,
        to: email,
        subject: `🔐 Password changed for your ${APPNAME} account`,
        html: this.getBaseTemplate(content),
      };

      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`Password changed notification email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send password changed email:", error);
      // Don't throw here as this is not critical for the user flow
    }
  }
}