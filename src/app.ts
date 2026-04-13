import dotenv from "dotenv"
dotenv.config()
import { webcrypto as wc, randomBytes } from "crypto";
import crypto from "crypto";
const subtle = wc.subtle;
import express, { type Application, type Request, type Response, type NextFunction } from "express"
// import { Authroute } from "./auth/route"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
// import mongoose, { Types } from "mongoose"
import { config } from "./config"
import swaggerUi from 'swagger-ui-express';
import { createServer } from "http";
import mongoSanitize from "express-mongo-sanitize";
// import index



import { PaymentService } from "./services/payment.service";
import { APPNAME } from "./mail/template";
import { run } from "./utils/run";

// import { socketInit } from "./controllers/socket";



const app: Application = express()
// const httpServer = socketInit(app)

import { decryptBodyMiddleware, getUserWithToken } from "./middleware/auth.middleware";

import { savebodysecretprocessenv } from "./cryptic";

// import { redis } from "./services/redis.service";
// import { BankAdminRoutes } from "./routes/bankAdmin";

import { xssSanitizerMiddleware } from "./middleware/sanitize.middleware";
import { runIndex } from "./models/indexes";
import { Indexroute } from "./routes";
import { getDB } from "./models/db.connection";
// import { ReleasesRoutes } from "./routes/releases.routes";
// const connectedSockets = new Map<string, any>();
// const httpServer = createServer(app);

// Allow CORS for testing
let vdb= getDB("prod")

const PORT = config.port
app.post("/paystack/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    // console.log("jdjdjdjdjdjjdjdjd",process.env.PAYSTACK_SECRET!)
    // Verify Paystack signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET!)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("invalid signature",hash,"\n")
      console.log(req.headers["x-paystack-signature"])
      // console.log(req.body)
      return res.status(401).send("Invalid signature");
    }

     const { event, data } = JSON.parse(req.body.toString("utf8"));
    //  console.log("nnnnN",data,"\n",event,"Nnnnnn")
  await PaymentService.webhook(event,data)

    return res.status(200).send("OK");
  }

  catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("Server error");
  }
})
// app.set('trust proxy', 1);

/**
 * Connect to MongoDB
 */


savebodysecretprocessenv()
/**
 * Apply security middleware
 */
app.use(helmet())

const allowedOrigins = [
  "http://dev.localhost:3000",
  "http://localhost:3000", // other dev URLs
];
app.use(
  cors(
    {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "SG-API-KEY"],
    credentials: true,
  }
),
)
  app.get("/api/public-key", (req, res) => {
  res.json({ publicKey: process.env.BODYPUBLICKEY });
});

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Apply rate limiting to prevent abuse
 */
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     status: "error",
//     message: "Too many requests, please try again later.",
//   },
// })
// app.use(limiter)

/**
 * Request parsing middleware
 */


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(decryptBodyMiddleware)
/**
 * API Routes
*/
app.use((req, res, next) => {
  console.log("SANITIZED BODY:", req.body);
  next();
});
app.use(mongoSanitize());
app.use(xssSanitizerMiddleware);
// getDB
// app.get("/",(req,res)=>{

//   return res.json({"who are you":"my friend"})
// })
   app.get("/",(req,res)=>{

  return res.json({"who are you":"my friend"})
})
app.use("/api", new Indexroute().router)
// app.use("/api/dev", new BankAdminRoutes().router)




/**
 * Default route
 */
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "online",
    message: `${APPNAME} API is running`,
    version: "1.0.0",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  })
})

/**
 * Global error handling middleware
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`${req.method} ${req.url}: ${err.message}`)
  console.error(err.stack || "No stack trace available")

  res.status(500).json({
    status: "error",
    message: "An unexpected error occurred",
    error: config.nodeEnv === "production" ? undefined : err.message,
  })
})

/**
 * Start the server
 */
app.listen(PORT,"0.0.0.0", async () => {
  // await redis.connect()
  console.log(`✅ Server is running on http://${config.host}:${PORT}`)
  console.log(`✅ Environment: ${config.nodeEnv}`)
  runIndex()
  run()
})


/**
 * Handle unhandled promise rejections
 */
process.on("unhandledRejection", (reason: any) => {
  console.error("Unhandled Promise Rejection:")
  console.error(reason)
})

/**
 * Handle uncaught exceptions
 */
process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:")
  console.error(error)

  // Exit with error
  process.exit(1)
})


async function initKeys() {
  const { privateKey, publicKey } = await subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits", "deriveKey"]
  );
 let serverPrivateKey = privateKey;
 let  serverPublicKeyJwk = await subtle.exportKey("jwk", publicKey);

 console.log(serverPrivateKey,serverPublicKeyJwk)

  // 👉 In prod, export & persist private key securely; sample:
  // const privJwk = await subtle.exportKey("jwk", privateKey);
  // console.log("STORE THIS PRIVATE JWK IN .env/KMS:", JSON.stringify(privJwk));
}



