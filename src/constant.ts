import { Types } from "mongoose";
export const EMAIL_DRIVER = "custom"
export const APP_NAME = "Infinitilink"
export const EVERVAULT_ENCRYPT_URL = "https://api.evervault.com/encrypt"
export const EVERVAULT_DECRYPT_URL = "https://api.evervault.com/decrypt"
export const production = false
// export const DOMAIN =production?"https://infinitilink.vercel.app": "http://localhost:3000"
export const DOMAIN =production?"https://sqaurel.ink": "http://localhost:3000"
export const GOOGLE_REDIRECT_URI = `${DOMAIN}/api/auth/google`;
/**
 * OTP Types
 * Different types of one-time passwords used in the application
 */
export enum OTPTYPE {
  forgotPassword = "forgotPassword",
  emailVerification = "emailVerification",
  bankAdminEmailVerification = "bankAdminEmailVerification",
}
export const POINTER_BRANCH_ID = new Types.ObjectId("000000000000000000000000");
export const POINTER_COMMIT_ID = new Types.ObjectId("000000000000000000000001");
/**
 * Authentication Types
 * Different methods of third-party authentication
 */
export enum AUTHTYPEWITHTHIRDPARTY {
  google = "google",
}



export enum EACCESSTYPE{
  account="account",
  project="project"
}







export const paginatenumber = 10




export enum STATUS {
  AUTHERROR="autherror",
  ERROR="error",
  SUCCESS="success",
  NOACCESSCODE="no_access_code",
  NOUSER="no_user",
  NOTADMIN="not_admin",
  NOTAUTHTOKEN="not_auth_token"
}


export const APP_MAIL = "princewillasotibe123@gmail.com";