import express from "express"
import { AuthController } from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth.middleware"

export class AuthRoutes {
  router: express.Router
  private authController: AuthController

  constructor() {
    this.router = express.Router()
    this.authController = new AuthController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post("/login", this.authController.login.bind(this.authController))
    // this.router.get("/github", this.authController.github.bind(this.authController))
    this.router.get("/google", this.authController.google.bind(this.authController))
    this.router.get("/google/callback", this.authController.googlecallback.bind(this.authController))
    // this.router.get("/github/callback", this.authController.githubcallback.bind(this.authController))
    // this.router.post("/google", this.authController.googleAuth.bind(this.authController))
    // this.router.post("/thirdpartysignup", this.authController.thirdPartySignup.bind(this.authController))
    // this.router.post("/thirdpartylogin", this.authController.thirdPartyLogin.bind(this.authController))
    this.router.post("/signup", this.authController.signup.bind(this.authController))
    this.router.get("/logout", this.authController.logout.bind(this.authController))
    this.router.post("/verify-email", this.authController.verifyEmail.bind(this.authController))
    // this.router.post("/verify-bvn", this.authController.verifyEmail.bind(this.authController))
    // this.router.get("/auth-key", this.authController.getAuthKey.bind(this.authController))
    // this.router.post("/auth-pin", this.authController.createAuthPin.bind(this.authController))
    // this.router.post("/verify-auth-pin", this.authController.createAuthPin.bind(this.authController))

    // this.router.post("/update-user-biodata", this.authController.updateuserbiodata.bind(this.authController))
    this.router.post("/user-settings", this.authController.updateusersettings.bind(this.authController))
    this.router.get("/user-settings", this.authController.getusersettings.bind(this.authController))
    // this.router.post("/find-users", this.authController.findUsers.bind(this.authController))

    this.router.post("/forgot-password", this.authController.forgotPassword.bind(this.authController))
    this.router.post("/reset-password", this.authController.resetPassword.bind(this.authController))

    this.router.post("/resend-otp", this.authController.resendOtp.bind(this.authController))
    // this.router.post("/create-secret-phrase", this.authController.addSecretPhrase.bind(this.authController))
    // this.router.post("/verify-secret-phrase", this.authController.verifySecretPhrase.bind(this.authController))

    // this.router.post("/login-secret-phrase", this.authController.loginSecretPhrase.bind(this.authController))
    // this.router.post("/sendUnboardedEmailOtp", this.authController.resendUnboardedEmailOtp.bind(this.authController))

  }  
}


