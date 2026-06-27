import type { Request, Response } from "express"
import { AuthService } from "../services/auth.service"
import { DOMAIN, GOOGLE_REDIRECT_URI, OTPTYPE, production } from "../constant"
import { EmailService, mailer } from "../services/email.service"
// import { AccesscodeService } from "../services/accesscode.service"
// import { KYCService } from "../services/kyc.service"

import axios from "axios";
import { DECORATORS, UseMiddleware } from "../middleware/auth.middleware";
import { checkRateLimit, manageReturnedError, overideObj, recordRateAttempt } from "../utils/utils";
// import { DojahService } from "src/services/dojah";
// import { BvnService } from "../services/bvn.service";
import { ERRORSMG } from "../error/error";



/**
 * Authentication Controller
 *
 * Handles HTTP requests related to authentication:
 * - User registration
 * - Login
 * - Email verification
 * - Password management
 * - OAuth integration
 */

const GITHUB_CLIENT_ID = production?process.env.GITHUB_CLIENT_ID!:process.env.TEST_GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = production?process.env.GITHUB_CLIENT_SECRET!:process.env.TEST_GITHUB_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = production?process.env.GOOGLE_CLIENT_ID:process.env.TEST_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = production?process.env.GOOGLE_CLIENT_SECRET:process.env.TEST_GOOGLE_CLIENT_SECRET;

const {authenticate,authenticateNoSecret} = DECORATORS;
export class AuthController {

  async login(req: Request, res: Response) {
    const { email, password } = req.body
    try {
        //  let v =   checkRateLimit({req,email})

      // Validate request
      if (!email || !password) {
        recordRateAttempt({req,email})
        return res.status(400).json({
          status: "error",
          message: "Email and password are required",
        })
      }

      // Authenticate user
      const data = await AuthService.authenticateUser({ email, password })
 recordRateAttempt({req,email,success:true})
      return res.json({
        success:true,
        status: "success",
        ...data,
      })
          
    } catch (e: any) {
       recordRateAttempt({req,email,success:false})
      console.error("Login error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "Authentication failed",
      })
    }
  }
  async loginTestUser(req: Request, res: Response) {
    const { email, password } = req.body
    try {
        //  let v =   checkRateLimit({req,email})

      // Validate request
      if (!email || !password) {
        recordRateAttempt({req,email})
        return res.status(400).json({
          status: "error",
          message: "Email and password are required",
        })
      }

      // Authenticate user
      const data = await AuthService.authenticateTestUser({ email, password })
 recordRateAttempt({req,email,success:true})
      return res.json({
        success:true,
        status: "success",
        ...data,
      })
          
    } catch (e: any) {
       recordRateAttempt({req,email,success:false})
      console.error("Login error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "Authentication failed",
      })
    }
  }






  //  @UseMiddleware(authenticate)
  async findUsers(req: Request, res: Response) {
    try {
      const { title } = req.body

      // Validate request
      if (!title ||title?.trim()=="") {
        return res.status(400).json({
          status: "error",
          message: "title is required",
        })
      }

      // Authenticate user
      const data = await AuthService.findUsers({title})

      return res.json({
        success:true,
        status: "success",
        data,
      })
    } catch (e: any) {
      console.error("Login error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "Authentication failed",
      })
    }
  }
async github(req: Request, res: Response){
  // const {ref} = req.query
  // let refquery = ref?`ref=${ref}`:""
  if(req.query.code){
    const redirect_uri = `${DOMAIN}/authp?code=${req.query.code}&authType=github`;
    return   res.redirect(redirect_uri);
  }
const redirect_uri = `${DOMAIN}/api/auth/github`;
res.redirect(
  `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=user:email`
);

}



async google(req: Request, res: Response){

  if(req.query.code){
    const redirect_uri = `${DOMAIN}/authp?code=${req.query.code}&authType=google`;
    return   res.redirect(redirect_uri);
  }
   const redirectUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}` +
    `&response_type=code&scope=openid%20email%20profile`;

  res.redirect(redirectUrl);
}

  /**
   * Handle user login with email and password
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  async githubcallback(req: Request, res: Response) {
    try {
  let d =  await AuthService.githubcallback({code:req.query.code as string})
  return res.json(d)
    } catch (e: any) {
      console.error("Login error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "Authentication failed",
      })
    }
  }
  async googlecallback(req: Request, res: Response) {
    try {
  let d =  await AuthService.googlecallback({code:req.query.code as string})
  return res.json(d)
    } catch (e: any) {
      console.error("Login error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "Authentication failed",
      })
    }
  }

  /**
   * Handle Google OAuth authentication
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  async googleAuth(req: Request, res: Response) {
    try {
      const { token } = req.body

      // Validate request
      if (!token) {
        return res.status(400).json({
          status: "error",
          message: "Token is required",
        })
      }

      // Authenticate with Google
      // const data = await AuthService.googleAuth(token)
      const data ={}

      return res.json({
        status: "success",
        ...data,
      })
    } catch (e: any) {
      console.error("Google auth error:", e)
      return res.status(401).json({
        status: "error",
        message: e.message || "Authentication failed",
      })
    }
  }



  /**
   * Handle user registration
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  async signup(req: Request, res: Response) {
    try {
      const { email, password, lastname, firstname } = req.body
      const {ref} = req.query as any

      // Validate request
      if (!email || !password || !lastname || !firstname) {
        return res.status(400).json({
          status: "error",
          message: "All fields are required",
        })
      }

      // Register user
      const data = await AuthService.signupUser({ email, password, lastname, firstname,ref })

      return res.json({
        status: "success",
        ...(data??{}),
      })
    } catch (e: any) {

            return manageReturnedError({
              error: e,
              overideError: 
              overideObj(

                ERRORSMG.SOMETHING_WENT_WRONG_ERROR,{
                  message:"Registration failed"
                }
              ),
              res
            });
      // console.error("Signup error:", e)
      // return res.status(400).json({
      //   status: "error",
      //   message: e.message || "Registration failed",
      // })
    }
  }
  async signupUserTest(req: Request, res: Response) {
    try {
      const { email, password, lastname, firstname } = req.body
      const {ref} = req.query as any

      // Validate request
      if (!email || !password || !lastname || !firstname) {
        return res.status(400).json({
          status: "error",
          message: "All fields are required",
        })
      }

      // Register user
      const data = await AuthService.signupUserTest({ email, password, lastname, firstname,ref })

      return res.json({
        status: "success",
        ...(data??{}),
      })
    } catch (e: any) {

            return manageReturnedError({
              error: e,
              overideError: 
              overideObj(

                ERRORSMG.SOMETHING_WENT_WRONG_ERROR,{
                  message:"Registration failed"
                }
              ),
              res
            });
      // console.error("Signup error:", e)
      // return res.status(400).json({
      //   status: "error",
      //   message: e.message || "Registration failed",
      // })
    }
  }
  @UseMiddleware(authenticate)
  async logout(req: Request, res: Response) {
    try {
      // const { email, password, lastname, firstname } = req.body
      const {ref} = req.user as any

 

      // Register user
      const data = await AuthService.logout({ user:req?.user })

      return res.json({
        status: "success",
  success:true
      })
    } catch (e: any) {
      console.error("Signup error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "failed to log out",
      })
    }
  }

  /**
   * Handle email verification with OTP
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, otp } = req.body

      // Validate request
      if (!email || !otp) {
        return res.status(400).json({
          status: "error",
          message: "Email and OTP are required",
        })
      }

      // Verify email
      const data = await AuthService.verifyEmail({ email, otp })

      return res.json({
        status: "success",
        success:true,
        data:data,
        // ...data,
      })
    } catch (e: any) {
      console.error("Email verification error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "Email verification failed",
      })
    }
  }
    //  @UseMiddleware(authenticate)
  async getAuthKey(req: Request, res: Response) {
    try {
    //   const { email, otp } = req.body

    //   // Validate request
    //   if (!email || !otp) {
    //     return res.status(400).json({
    //       status: "error",
    //       message: "Email and OTP are required",
    //     })
    //   }

      // Verify email
      const data = await AuthService.handleGetAuthEncryptionKey("")

      return res.json({
       data,
        success:true
        // ...data,
      })
    } catch (e: any) {
      console.error("get Auth Key error:", e)

      // let err =  manageReturnedError(e,ERRORSMG.SOMETHING_WENT_WRONG_ERROR)
      // return res.status(err.statusCode).json(err)

       return manageReturnedError({error:e,overideError:ERRORSMG.SOMETHING_WENT_WRONG_ERROR,res})
    }
  }
      @UseMiddleware(authenticate)
  async createAuthPin(req: Request, res: Response) {
    try {

      const data = await AuthService.createVerificationPin({user:req.user,pin:req.body.pin,keyId:req.body.keyId})

      return res.json({
       data,
        success:true
        // ...data,
      })
    } catch (e: any) {
      console.error("create auth pin  error:", e)

      // let err =  manageReturnedError(e,ERRORSMG.SOMETHING_WENT_WRONG_ERROR)
      // return res.status(err.statusCode).json(err)

       return manageReturnedError({error:e,overideError:ERRORSMG.SOMETHING_WENT_WRONG_ERROR,res})
    }
  }


@UseMiddleware(authenticate)
  async updateuserbiodata(req: Request, res: Response) {
    try {
      // const { email, otp } = req.body



      // Verify email
      const data = await AuthService.updateUserBiodata(req.body,req.user._id?.toString())

      return res.json({
        status: "success",
        success:true,
        data,
      })
    } catch (e: any) {
      console.error("bio data update error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "error",
      })
    }
  }
@UseMiddleware(authenticate)
  async updateusersettings(req: Request, res: Response) {
    try {
      // const { email, otp } = req.body



      // Verify email
      const data = await AuthService.updateUserSetting(req.body,req.user._id)

      return res.json({
        status: "success",
        success:true,
        data,
      })
    } catch (e: any) {
      console.error("bio data update error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "error",
      })
    }
  }
@UseMiddleware(authenticate)
  async getusersettings(req: Request, res: Response) {
    try {
      // const { email, otp } = req.body



      // Verify email
      const data = await AuthService.getUserSetting(req.user._id)

      return res.json({
        status: "success",
        success:true,
        data,
      })
    } catch (e: any) {
      console.error("bio data update error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "error",
      })
    }
  }



  /**
   * Handle forgot password request
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body

      // Validate request
      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required",
        })
      }

      // Process forgot password request
      const data = await AuthService.forgotPassword({ email })

      return res.json({
        success:true,
        status: "success",
        ...data,
      })
    } catch (e: any) {
      console.error("Forgot password error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "Failed to process forgot password request",
      })
    }
  }

  /**
   * Handle password reset with OTP
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body

      // Validate request
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          status: "error",
          message: "Email, OTP, and new password are required",
        })
      }

      // Reset password
      const data = await AuthService.resetPassword({ email, otp, newPassword })

      return res.json({
        success:true,
        status: "success",
        ...data,
      })
    } catch (e: any) {
      console.error("Reset password error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "Failed to reset password",
      })
    }
  }

  /**
   * Handle OTP resend requests
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  async resendOtp(req: Request, res: Response) {
    try {
      const { email, type } = req.body

      // Validate request
      if (!email || !type) {
        return res.status(400).json({
          status: "error",
          message: "Email and type are required",
        })
      }

      // Validate OTP type
      if (type !== OTPTYPE.emailVerification && type !== OTPTYPE.forgotPassword) {
        return res.status(400).json({
          status: "error",
          message: "Invalid OTP type",
        })
      }

      // Generate and send new OTP
      let otp;
      if (type === OTPTYPE.emailVerification) {
        otp = await mailer.sendVerificationEmail(email)
      } else {
        otp = await mailer.sendForgotPasswordEmail(email)
      }

      return res.json({
        status: "success",
        success:true,
        message: "OTP sent successfully",
      })
    } catch (e: any) {
      console.error("Resend OTP error:", e)
      console.dir( e?.response?.data,{depth:5})
      return res.status(400).json({
        status: "error",
        message: e.message || "Failed to resend OTP",
      })
    }
  }
  async resendUnboardedEmailOtp(req: Request, res: Response) {
    try {
      const { email, type } = req.body

      // Validate request
      if (!email || !type) {
        return res.status(400).json({
          status: "error",
          message: "Email and type are required",
        })
      }

      // Validate OTP type
      if (type !== OTPTYPE.emailVerification) {
        return res.status(400).json({
          status: "error",
          message: "Invalid OTP type",
        })
      }

      // Generate and send new OTP

    let  otp = await AuthService.sendUnboardedEmailOtp({email,type})
   

      return res.json({
        status: "success",
        message: "OTP sent successfully",
      })
    } catch (e: any) {
      console.error("Resend OTP error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "Failed to resend OTP",
      })
    }
  }
  // async sendEmailUnboardedOtp(req: Request, res: Response) {
  //   try {
  //     const { email, type } = req.body

  //     // Validate request
  //     if (!email || !type) {
  //       return res.status(400).json({
  //         status: "error",
  //         message: "Email and type are required",
  //       })
  //     }

  //     // Validate OTP type
  //     if (type !== OTPTYPE.emailVerification && type !== OTPTYPE.forgotPassword) {
  //       return res.status(400).json({
  //         status: "error",
  //         message: "Invalid OTP type",
  //       })
  //     }

  //     // Generate and send new OTP
  //     let otp
  //     if (type === OTPTYPE.emailVerification) {
  //       otp = await EmailService.sendVerificationEmail(email)
  //     } else {
  //       otp = await EmailService.sendForgotPasswordEmail(email)
  //     }

  //     return res.json({
  //       status: "success",
  //       message: "OTP sent successfully",
  //     })
  //   } catch (e: any) {
  //     console.error("Resend OTP error:", e)
  //     return res.status(400).json({
  //       status: "error",
  //       message: e.message || "Failed to resend OTP",
  //     })
  //   }
  // }


  // async createAccessCode(req:Request,res:Response){

  //   try {

  //     const email:string =  req?.user?.email
  //     if(email){
   
  //    let code = await   AccesscodeService.createcode({email})
   
  //    res.json({code})
  //     }
  //   }catch(e){

  //     res.status(500).json({message:"An error occured"})

  //   }

  // }



 
}

