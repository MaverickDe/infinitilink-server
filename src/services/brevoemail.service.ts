// import nodemailer from "nodemailer";
// import { config } from "@shared/config";
// import { OTPTYPE, APPNAME, DOMAIN } from "../constant";
// import { OtpService } from "./otp.service";
// import SibApiV3Sdk from "sib-api-v3-sdk";

// // import { OtpService } from "../otp/service"

// /**
//  * Email Service
//  *
//  * Handles sending emails for various purposes like verification, password reset, etc.
//  */
// export class EmailService {
//   /**
//    * Create a reusable transporter object using SMTP transport
//    */
//   private static getTransporter() {
//     // For Gmail
//     if (config.emailService === "gmail") {
//       return nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: config.emailUser,
//           pass: config.emailPass,
//         },
//       });
//     }

//     // For other SMTP services
//     return nodemailer.createTransport({
//       host: config.emailHost,
//       port: config.emailPort,
//       secure: config.emailSecure,
//       auth: {
//         user: config.emailUser,
//         pass: config.emailPass,
//       },
//     });
//   }

//   /**
//    * Send verification email with OTP
//    *
//    * @param email - Recipient email address
//    * @returns The OTP sent in the email
//    */
//   static async sendVerificationEmail(email: string): Promise<string> {
//     try {
//       // Generate OTP
//       const otp = await OtpService.generateOtp({
//         email,
//         type: OTPTYPE.emailVerification,
//       });
//       console.log(otp, "toppppp");
//       // Create email content
//       const mailOptions = {
//         from: `"${APPNAME} App" <${config.emailFrom}>`,
//         to: email,
//         subject: `Verify Your Email Address - ${APPNAME} App`,
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//             <div style="text-align: center; margin-bottom: 20px;">
//               <h1 style="color: #333;">${APPNAME} App</h1>
//             </div>
//             <h2 style="color: #333;">Verify Your Email</h2>
//             <p>Thank you for signing up with ${APPNAME} App. To complete your registration, please use the following verification code:</p>
//             <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
//               ${otp}
//             </div>
//             <p style="margin-top: 20px; font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
//             <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn't request this verification, please ignore this email.</p>
//             <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//               &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//             </div>
//           </div>
//         `,
//       };

//       // Send email
//       const transporter = this.getTransporter();
//       await transporter.sendMail(mailOptions);

//       console.log(`Verification email sent to ${email}`);
//       return otp;
//     } catch (error) {
//       console.error("Failed to send verification email:", error);
//       throw new Error("Failed to send verification email");
//     }
//   }

//   /**
//    * Send password reset email with OTP
//    *
//    * @param email - Recipient email address
//    * @returns The OTP sent in the email
//    */
//   static async sendForgotPasswordEmail(email: string): Promise<string> {
//     try {
//       // Generate OTP
//       const otp = await OtpService.generateOtp({
//         email,
//         type: OTPTYPE.forgotPassword,
//       });

//       // Create email content
//       const mailOptions = {
//         from: `"${APPNAME} App" <${config.emailFrom}>`,
//         to: email,
//         subject: `Reset Your Password - ${APPNAME} App`,
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//             <div style="text-align: center; margin-bottom: 20px;">
//               <h1 style="color: #333;">${APPNAME} App</h1>
//             </div>
//             <h2 style="color: #333;">Reset Your Password</h2>
//             <p>We received a request to reset your password. Please use the following code to reset your password:</p>
//             <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
//               ${otp}
//             </div>
//             <p style="margin-top: 20px; font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
//             <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
//             <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//               &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//             </div>
//           </div>
//         `,
//       };

//       // Send email
//       const transporter = this.getTransporter();
//       await transporter.sendMail(mailOptions);

//       console.log(`Password reset email sent to ${email}`);
//       return otp;
//     } catch (error) {
//       console.error("Failed to send password reset email:", error);
//       throw new Error("Failed to send password reset email");
//     }
//   }

//   /**
//    * Send welcome email after successful registration
//    *
//    * @param email - Recipient email address
//    * @param name - User's first name
//    */
//   static async sendWelcomeEmail(email: string, name: string): Promise<void> {
//     try {
//       // Create email content
//       const mailOptions = {
//         from: `"${APPNAME} App" <${config.emailFrom}>`,
//         to: email,
//         subject: `Welcome to ${APPNAME} App!`,
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//             <div style="text-align: center; margin-bottom: 20px;">
//               <h1 style="color: #333;">${APPNAME} App</h1>
//             </div>
//             <h2 style="color: #333;">Welcome, ${name}!</h2>
//             <p>Thank you for joining ${APPNAME} App. Your account has been successfully verified and is now ready to use.</p>
//             <p>With ${APPNAME} App, you can:</p>
//             <ul style="margin-top: 20px; margin-bottom: 20px;">
//               <li>Manage your digital assets securely</li>
//               <li>Send and receive payments</li>
//               <li>Access exclusive features and services</li>
//             </ul>
//             <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
//             <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//               &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//             </div>
//           </div>
//         `,
//       };

//       // Send email
//       const transporter = this.getTransporter();
//       await transporter.sendMail(mailOptions);

//       console.log(`Welcome email sent to ${email}`);
//     } catch (error) {
//       console.error("Failed to send welcome email:", error);
//       // Don't throw here as this is not critical for the user flow
//     }
//   }
// }

// export class BrevoEmailService {
//   static sendVerificationEmail = async ({
//     email,
//     name = "user",
//   }: {
//     email: string;
//     name?: string;
//   }) => {
//     const otp = await OtpService.generateOtp({
//       email,
//       type: OTPTYPE.emailVerification,
//     });
//     console.log(otp);
//     await sendMailWithBrevo({
//       to: { email, name },
//       content: MAILCONTENT.emailverification({ otp }),
//     });
//   };
//   static sendUserWailistJoinSuccessEmail = async ({
//     email,
//     fullName = "user",
//     ...data
//   }: Waitlist) => {
//     const otp = await OtpService.generateOtp({
//       email,
//       type: OTPTYPE.emailVerification,
//     });
//     console.log(otp);
//     await sendMailWithBrevo({
//       to: { email, name:fullName },
//       content: MAILCONTENT.waitlistUser({ email }),
//     });
//   };
//   static sendCompanyWailistJoinSuccessEmail = async ({
//     email,
//     fullName = "user",
//     ...data
//   }: Waitlist) => {
  
  
//     await sendMailWithBrevo({
//       to: { email:"hello@findtech.ai", name:fullName },
//       content: MAILCONTENT.waitlistCompany({ email ,fullName,...data}),
//     });
//   };
//   static sendWailistJoinSuccessEmail = async (data: Waitlist) => {
  
//   await this.sendCompanyWailistJoinSuccessEmail(data)
//   await this.sendUserWailistJoinSuccessEmail(data)
//     // await sendMailWithBrevo({
//     //   to: { email, name:fullName },
//     //   content: MAILCONTENT.waitlistCompany({ email ,fullName,...data}),
//     // });
//   };


//   static sendDeleteAccountSuccessEmail = async ({
//     email,
//     fullName = "user",
//   }: {
//     email: string;
//     fullName?: string;
//   }) => {
//     const otp = await OtpService.generateOtp({
//       email,
//       type: OTPTYPE.emailVerification,
//     });
//     console.log(otp);
//     await sendMailWithBrevo({
//       to: { email, name: fullName },
//       content: MAILCONTENT.deleteSuccessful({ userName: fullName || email }),
//     });
//   };
//   static sendInMessageEmail = async ({
//     message,
//     fromUser,
//     toUser,
//   }: {
//     message: string;
//     fromUser: User;
//     toUser: User;
//   }) => {
//     //  const otp = await OtpService.generateOtp({ email, type: OTPTYPE.emailVerification })
//     //  console.log(otp)
//     await sendMailWithBrevo({
//       to: { email: toUser.email, name: toUser.fullName },
//       content: MAILCONTENT.messageEmail({ fromUser, toUser, message }),
//     });
//   };
//   static sendPasswordCahangeEmail = async ({ user }: { user: User }) => {
//     //  const otp = await OtpService.generateOtp({ email, type: OTPTYPE.emailVerification })
//     //  console.log(otp)
//     await sendMailWithBrevo({
//       to: { email: user.email, name: user.fullName || user.email },
//       content: MAILCONTENT.passwordChange({
//         userName: user.fullName || user.email,
//       }),
//     });
//   };
//   static sendPasswordResetEmail = async ({ email }: { email: string }) => {
//     //  const otp = await OtpService.generateOtp({ email, type: OTPTYPE.emailVerification })
//     //  console.log(otp)
//     await sendMailWithBrevo({
//       to: { email: email, name: "user"  },
//       content: MAILCONTENT.passwordChange({
//         userName: "user",
//       }),
//     });
//   };
//   static sendForgotPasswordEmail = async ({ email }: { email:string }) => {
//      const otp = await OtpService.generateOtp({ email, type: OTPTYPE.forgotPassword })
//     //  console.log(otp)
//     await sendMailWithBrevo({
//       to: { email: email, name: "user" },
//       content: MAILCONTENT.forgotPassword({
//         otp
//       }),
//     });
//   };
//   static sendReplyInMessageEmail = async ({
//     message,
//     fromUser,
//     toUser,
//   }: {
//     message: string;
//     fromUser: User;
//     toUser: User;
//   }) => {
//     //  const otp = await OtpService.generateOtp({ email, type: OTPTYPE.emailVerification })
//     //  console.log(otp)
//     await sendMailWithBrevo({
//       to: { email: toUser.email, name: toUser.fullName || toUser.email },
//       content: MAILCONTENT.replyMessageEmail({ fromUser, toUser, message }),
//     });
//   };
// }
// // const apiKey = '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';  // Replace with your actual API key
// // SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey;
// // const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();// file: sendMail.js
// // const Sib = require('sib-api-v3-sdk');
// import Sib from "sib-api-v3-sdk";
// import { User, Waitlist } from "@shared/schema";
// import { StringChunk } from "drizzle-orm";
// // Set your API key
// const client = Sib.ApiClient.instance;
// const apiKey = client.authentications["api-key"];
// apiKey.apiKey =
//   "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"; // replace this

// // Create instance of transactional email API
// const tranEmailApi = new Sib.TransactionalEmailsApi();

// interface IBrevoMail {
//   // email:string
//   to: {
//     email: string;
//     name: string;
//   };
//   content: {
//     subject: string;
//     htmlContent: string;
//   };
// }

// export class MAILCONTENT {



//  static waitlistCompany = ({
//   email,
//   fullName,
//   role,
//   createdAt,
// }: Waitlist) => {
//   const createdDate =
//     createdAt instanceof Date
//       ? createdAt.toLocaleString()
//       : new Date((createdAt||"")?.toString()).toLocaleString();

//   return {
//     subject: `New Waitlist Signup - ${APPNAME}`,
//     htmlContent: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//         <div style="text-align: center; margin-bottom: 20px;">
//           <h1 style="color: #333;">${APPNAME} App</h1>
//         </div>
//         <h2 style="color: #333;">New Waitlist Signup</h2>
//         <p>A new user has joined the waitlist:</p>
        
//         <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 16px;">
//           <tr>
//             <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Full Name</td>
//             <td style="padding: 8px; border: 1px solid #e0e0e0;">${fullName}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Email</td>
//             <td style="padding: 8px; border: 1px solid #e0e0e0;">${email}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Role</td>
//             <td style="padding: 8px; border: 1px solid #e0e0e0;">${role ||"Seller"}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #e0e0e0; font-weight: bold;">Joined At</td>
//             <td style="padding: 8px; border: 1px solid #e0e0e0;">${createdDate}</td>
//           </tr>
//         </table>

//         <p style="margin-top: 20px; font-size: 14px; color: #777;">Keep track of this signup in your dashboard.</p>
        
//         <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//           &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//         </div>
//       </div>
//     `,
//   };
// };

//   // Email to user confirming they joined waitlist
//   static waitlistUser = ({ email }: { email: string }) => {
//     return {
//       subject: `You're on the Waitlist! - ${APPNAME}`,
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//           <div style="text-align: center; margin-bottom: 20px;">
//             <h1 style="color: #333;">${APPNAME} App</h1>
//           </div>
//           <h2 style="color: #333;">Welcome to the Waitlist!</h2>
//           <p>Hi there 👋,</p>
//           <p>Thanks for joining the waitlist for <strong>${APPNAME}</strong>. We’re excited to have you onboard!</p>
//           <p>We’ll notify you at <strong>${email}</strong> as soon as we launch and give you early access.</p>
//           <p style="margin-top: 20px; font-size: 14px; color: #777;">In the meantime, feel free to share ${APPNAME} with friends who might be interested.</p>
//           <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//             &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//           </div>
//         </div>
//       `,
//     };
//   };

// static forgotPassword = ({ otp }: { otp: any }) => {
//   return {
//     subject: `Reset Your Password - ${APPNAME} App`,
//     htmlContent: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//         <div style="text-align: center; margin-bottom: 20px;">
//           <h1 style="color: #333;">${APPNAME} App</h1>
//         </div>
//         <h2 style="color: #333;">Password Reset Request</h2>
//         <p>You requested to reset your password for your ${APPNAME} account. Use the following code to proceed:</p>
//         <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
//           ${otp}
//         </div>
//         <p style="margin-top: 20px; font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
//         <p style="margin-top: 30px; font-size: 14px; color: #777;">If you did not request a password reset, please ignore this email. Your account will remain secure.</p>
//         <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//           &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//         </div>
//       </div>
//     `,
//   }
// }

//   static deleteSuccessful = ({ userName }: { userName: string }) => {
//     return {
//       subject: "Account Deleted Successfully",
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px;">
//           <div style="text-align: center; margin-bottom: 20px;">
//             <h1 style="color: #d9534f;">${APPNAME} App</h1>
//           </div>
//           <h2 style="color: #333;">Account Deletion Successful</h2>
//           <p>Hi ${userName},</p>
//           <p>Your account has been <strong>successfully deleted</strong> from ${APPNAME}. All your data and activity have been permanently removed.</p>
//           <p>If this action was not performed by you, please contact our support team immediately.</p>
//           <p style="margin-top: 30px; font-size: 14px; color: #777;">
//             We're sorry to see you go. You’re always welcome back to ${APPNAME} anytime in the future.
//           </p>
//           <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//             &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//           </div>
//         </div>
//       `,
//     };
//   };

//   static deleteAccount = ({
//     userName,
//     deleteLink,
//   }: {
//     userName: string;
//     deleteLink: string;
//   }) => {
//     return {
//       subject: "Account Deletion Confirmation",
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px;">
//           <div style="text-align: center; margin-bottom: 20px;">
//             <h1 style="color: #d9534f;">${APPNAME} App</h1>
//           </div>
//           <h2 style="color: #333;">Account Deletion Request</h2>
//           <p>Hi ${userName},</p>
//           <p>We received a request to <strong>delete your account</strong>. Once deleted, all your data and activity will be permanently removed and cannot be recovered.</p>
//           <p>If you did not make this request, please contact our support team immediately.</p>
//           <div style="margin-top: 30px; text-align: center;">
//             <a href="${deleteLink}" 
//               style="background-color: #d9534f; color: #fff; padding: 12px 20px; border-radius: 5px; text-decoration: none;">
//               Confirm Account Deletion
//             </a>
//           </div>
//           <p style="margin-top: 20px; font-size: 14px; color: #777;">
//             If the button doesn’t work, copy and paste this link into your browser:<br />
//             <a href="${deleteLink}" style="color: #0d6efd;">${deleteLink}</a>
//           </p>
//           <p style="margin-top: 30px; font-size: 14px; color: #777;">
//             If you change your mind, you can ignore this email and your account will remain active.
//           </p>
//           <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//             &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//           </div>
//         </div>
//       `,
//     };
//   };
//   static passwordChange = ({ userName }: { userName: string }) => {
//     return {
//       subject: "Password Changed Successfully",
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px;">
//           <div style="text-align: center; margin-bottom: 20px;">
//             <h1 style="color: #333;">${APPNAME} App</h1>
//           </div>
//           <h2 style="color: #333;">Password Change Notification</h2>
//           <p>Hi ${userName},</p>
//           <p>
//             Your password has been <strong>successfully changed</strong>.  
//             If you made this change, no further action is required.
//           </p>
//           <p>
//             If you did <b>not</b> change your password, please reset it immediately to secure your account.
//           </p>
//           <div style="margin-top: 30px; text-align: center;">
//             <a href="${DOMAIN}/reset-password" 
//               style="background-color: #0d6efd; color: #fff; padding: 12px 20px; border-radius: 5px; text-decoration: none;">
//               Reset Password
//             </a>
//           </div>
//           <p style="margin-top: 30px; font-size: 14px; color: #777;">
//             If you have any issues, please contact our support team.
//           </p>
//           <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//             &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//           </div>
//         </div>
//       `,
//     };
//   };

//   static emailverification = ({ otp }: { otp: string }) => {
//     return {
//       subject: "Email Verification",
//       htmlContent: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//             <div style="text-align: center; margin-bottom: 20px;">
//               <h1 style="color: #333;">${APPNAME} App</h1>
//             </div>
//             <h2 style="color: #333;">Verify Your Email</h2>
//             <p>Thank you for signing up with ${APPNAME} App. To complete your registration, please use the following verification code:</p>
//             <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
//               ${otp}
//             </div>
//             <p style="margin-top: 20px; font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
//             <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn't request this verification, please ignore this email.</p>
//             <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
//               &copy; ${new Date().getFullYear()} ${APPNAME} App. All rights reserved.
//             </div>
//           </div>
//     `,
//     };
//   };
//   static messageEmail = ({
//     fromUser,
//     toUser,
//     message,
//   }: {
//     fromUser: { fullName: string; email: string };
//     toUser: { fullName: string; email: string };
//     message: string;
//   }) => {
//     return {
//       subject: `New Message from ${fromUser.fullName || fromUser.email}`,
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px;">
//           <h2 style="color: #333;">Hi ${toUser.fullName || toUser.email},</h2>
//           <p>You’ve received a new message from <strong>${
//             fromUser.fullName || fromUser.email
//           }</strong> on ${APPNAME}:</p>
//           <blockquote style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #007bff;">
//             ${message}
//           </blockquote>
//           <p style="margin-top: 30px; font-size: 14px; color: #777;">Login to ${APPNAME} to reply.</p>
//         </div>
//       `,
//     };
//   };
//   static replyMessageEmail = ({
//     fromUser,
//     toUser,
//     message,
//   }: {
//     fromUser: { fullName: string; email: string };
//     toUser: { fullName: string; email: string };
//     message: string;
//   }) => {
//     return {
//       subject: `Reply from ${fromUser.fullName}`,
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px;">
//           <h2 style="color: #333;">Hi ${toUser.fullName || toUser.email},</h2>
//           <p>You’ve received a new message from <strong>${
//             fromUser.fullName || fromUser.email
//           }</strong> on ${APPNAME}:</p>
//           <blockquote style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #007bff;">
//             ${message}
//           </blockquote>
//           <p style="margin-top: 30px; font-size: 14px; color: #777;">Login to ${APPNAME} to reply.</p>
//         </div>
//       `,
//     };
//   };
//   static generalParsedEmail = (
//     emailText: string,
//     head: string,
//     userCols: Record<string, string>
//   ) => {
//     let parsed = emailText;
//     for (const key in userCols) {
//       parsed = parsed.replace(new RegExp(`{{${key}}}`, "g"), userCols[key]);
//     }
//     return {
//       subject: head,
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px;">
//           ${parsed}
//         </div>
//       `,
//     };
//   };
//   static marketingEmail = (
//     emailText: string,
//     userCols: Record<string, string>
//   ) => {
//     let parsed = emailText;
//     for (const key in userCols) {
//       parsed = parsed.replace(new RegExp(`{{${key}}}`, "g"), userCols[key]);
//     }
//     return {
//       subject: `Exclusive Offer from ${APPNAME}`,
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px; background:#fdfdfd;">
//           ${parsed}
//         </div>
//       `,
//     };
//   };
//   static systemUpdate = (
//     emailText: string,
//     userCols: Record<string, string>
//   ) => {
//     let parsed = emailText;
//     for (const key in userCols) {
//       parsed = parsed.replace(new RegExp(`{{${key}}}`, "g"), userCols[key]);
//     }
//     return {
//       subject: `System Update from ${APPNAME}`,
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px;">
//           ${parsed}
//         </div>
//       `,
//     };
//   };
//   static tradeAlertPush = (
//     emailText: string,
//     userCols: Record<string, string>
//   ) => {
//     let parsed = emailText;
//     for (const key in userCols) {
//       parsed = parsed.replace(new RegExp(`{{${key}}}`, "g"), userCols[key]);
//     }
//     return {
//       subject: `Trade Alert - ${APPNAME}`,
//       htmlContent: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px; background:#fff9f0;">
//           ${parsed}
//         </div>
//       `,
//     };
//   };
// }

// export const sendMailWithBrevo = async (mail: IBrevoMail) => {
//   console.log("emailllllll2222");
//   try {
//     const sender = {
//       email: "hello@findtech.ai", // Must be a verified sender
//       name: "findtech",
//     };

//     const receivers = [
//       {
//         email: mail.to.email,
//         name: mail.to.name,
//       },
//     ];

//     const response = await tranEmailApi.sendTransacEmail({
//       sender,
//       to: receivers,
//       subject: mail.content.subject,
//       htmlContent: mail.content.htmlContent,
//     });

//     console.log("Email sent ✅", response);
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//   }
// };

// // export  const sendEmailVerificationMail =({email}:{email:string})=>{

// // }

// console.log("emailllllll");
// // sendMailWithBrevo();
