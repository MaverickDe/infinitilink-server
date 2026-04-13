console.log("Loading config.ts...")
console.log(
  `BRIDGE_API_KEY from env: ${process.env.BRIDGE_API_KEY ? `${process.env.BRIDGE_API_KEY.substring(0, 8)}...` : "Not set"}`,
)
console.log(`BRIDGE_BASE_URL from env: ${process.env.BRIDGE_BASE_URL || "Not set"}`)

export const config:any = {
  // Server configuration
  port: process.env.PORT ? Number(process.env.PORT) : 5002,
  host: process.env.HOST || "localhost",
  nodeEnv: process.env.NODE_ENV || "development",
 SERVER_KEY_ID : "v1",
// For demo, generate on boot. In prod: read from process.env (JWK string) or KMS/HSM.
 serverPrivateKey: "CryptoKey",
 serverPublicKeyJwk: "JsonWebKey",
  // MongoDB configuration
  mongodbUri: process.env.MONGODB_URI || process.env.MONGODB_URL || "mongodb://localhost:27017/producthunt",

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-jwt-secret-key-should-be-long-and-random",
  jwtExpiresIn:  "24h",
  evervaultAppId: process.env.EVERVAULT_APP_ID || "",
  evervaultKey: process.env.EVERVAULT_KEY || "",
  privySecretKey: process.env.PRIVY_API_SECRET || "",
  privyAppId: process.env.PRIVY_APP_ID || "",
redisurl:process.env.REDISURL,
  // Email configuration
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || "",
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  emailService: process.env.EMAIL_SERVICE || "gmail",
  emailHost: process.env.EMAIL_HOST || "",
  emailPort: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
  emailSecure: process.env.EMAIL_SECURE === "true",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

  // Google OAuth configuration
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "",

  

  // CORS configuration
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["http://localhost:3000"],

  // Logging configuration
  logLevel: process.env.LOG_LEVEL || "info",

  // OTP configuration
  otpExpiryMinutes: 10,

  // Validation
  passwordMinLength: 8,

  // Debug mode
  debug: process.env.DEBUG === "true",
}

