import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user";

import bcrypt from "bcryptjs";
import mongoose, { Types } from "mongoose";
import { STATUS } from "../constant";

import { config } from "../config";

import "reflect-metadata";


(async () => {
  setTimeout(async () => {
    try {
      let idToken =
        "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IklwMHdEcUVKZEhDT3pScUctZURncmVfVXU0cHlNQ0ozNnoxSFBPWExOcWMifQ.eyJjciI6IjE3NTE5ODY3NzIiLCJsaW5rZWRfYWNjb3VudHMiOiJbe1widHlwZVwiOlwiZ29vZ2xlX29hdXRoXCIsXCJzdWJqZWN0XCI6XCIxMDI2MTA4MjMwNDA5ODY1NjkwNTZcIixcImVtYWlsXCI6XCJqb3NlcGhpYm9rNzVAZ21haWwuY29tXCIsXCJuYW1lXCI6XCJKb3NlcGggSWJva1wiLFwibHZcIjoxNzUxOTkzNTE1fSx7XCJpZFwiOlwieXZrMjI4d3FqMGFocGV2OHJ5cG5zZW5sXCIsXCJ0eXBlXCI6XCJ3YWxsZXRcIixcImFkZHJlc3NcIjpcIkhmb3hqRHBjTU50aGo1dGNrMmhZaUpSMUVtQ1RWVHNGR3JVUWlnVmI2OGpLXCIsXCJjaGFpbl90eXBlXCI6XCJzb2xhbmFcIixcIndhbGxldF9jbGllbnRfdHlwZVwiOlwicHJpdnlcIixcImx2XCI6MTc1MTk4Njc3NX1dIiwiaXNzIjoicHJpdnkuaW8iLCJpYXQiOjE3NTE5OTM5MjUsImF1ZCI6ImNtYm0xbzE2eTAwaHJsNDBvbHVlOGJlMHgiLCJzdWIiOiJkaWQ6cHJpdnk6Y21jdW5vdGllMDA5d2w3MG5nbTVzYjFhdyIsImV4cCI6MTc1MTk5NzUyNX0.CHtSmmtxmFHD4r51KAEjOOp1T7kZkGOZz9CktCNv1JXZyf_-OhRec7kE5ZkyFLUHFxYaE0zyR3GiT1khB4ZZqg";
      // console.log(privy
      // const user = await privy.getUser({ idToken });
      // console.log("ccccuseee",user)
    } catch (e) {
      console.log(e, "Ee");
    }
  }, 3000);
})();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const EXCLUDE_METADATA_KEY = Symbol("exclude");

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let user;
  try {
    let data = req?.user ? { user: req.user } : await populateuser(req, res);
    //  let data = await populateuser(req,res)

    if (!data.user) {
      recordRateAttempt({ req, success: false, type: "brute" });

      return res
        .status(401)
        .json({
          message: "Authentication failed , Try logging in",
          status: STATUS.ERROR,
        });
    }

    user = data.user;

    // const redisKey = `redisAuthKey_${data.user._id}`
    //  let authKey ;
    //  try{

    //    authKey = await redis.get(redisKey)
    //  }catch(e){

    //  }
    // console.log(authKey,"auuuuuuu",data?.authKey)
    //  if(!data?.authKey ){
    //     recordRateAttempt({req,email:user.email,success:false,type:"brute"})
    //     return res.status(401).json({ message: "Authentication failed , Wrong secret",status:STATUS.ERROR })
    //  }
    //  user.authKey = data.authKey
    //  user.authKeyData=data?.authKeyData||{}
    recordRateAttempt({ req, email: user.email, success: true, type: "brute" });
    next();
  } catch (error) {
    if (user?.email) {
      recordRateAttempt({
        req,
        email: user.email,
        success: false,
        type: "brute",
      });
    }
    return res
      .status(400)
      .json({ message: "Authentication failed", status: STATUS.AUTHERROR });
    // next(error)d
  }
};
export const authenticateNoSecret = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let data = req?.user ? { user: req.user } : await populateuser(req, res);
    //  let data = await populateuser(req,res)

    console.log(data.user, "datauser");
    if (!data.user ) {
      return res
        .status(401)
        .json({
          message: "Authentication failed , Try logging in _",
          status: STATUS.ERROR,
        });
    }
    if (!data?.user?.emailIsVerified ) {
      return res
        .status(401)
        .json({
          message: "Authentication failed , Please verify ur email",
          status: STATUS.ERROR,
        });
    }

    // const redisKey = `redisAuthKey_${data.user_id}`
    //  let authKey = await redis.get(redisKey)

    //  if(!authKey || authKey!=data.authKey || authKey == "" ){
    //     return res.status(401).json({ message: "Authentication failed , Wrong secret",status:STATUS.ERROR })
    //  }

    next();
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Authentication failed", status: STATUS.AUTHERROR });
    // next(error)
  }
};

import "reflect-metadata";
import { decryptMessageFromKeyPair, handleDecrypt } from "../cryptic";
import { Hycache, redis } from "../services/redis.service";
import {
  getOneAggregate,
  manageReturnedError,
  recordRateAttempt,
} from "../utils/utils";
import { AuthService } from "../services/auth.service";
import { ERRORSMG } from "../error/error";
// import { BankAdmin, BankAdminModelName } from "../models/bankModels/bankAdmin";
// import { BankAdminApiCred } from "../models/bankModels/bankApi";
import { buildModels } from "../models/db.manager";
import { getDB } from "../models/db.connection";
import { E_DEV_ENVIRONMENT } from "../enums";

const EXCLUDE_ALL = Symbol("EXCLUDE_ALL");

export function ExcludeDecorator(
  decoratorsToExclude: "all" | any | any[],
): MethodDecorator {
  return (target, propertyKey) => {
    if (decoratorsToExclude === "all") {
      Reflect.defineMetadata(
        "excludedDecorators",
        [EXCLUDE_ALL],
        target,
        propertyKey,
      );
      return;
    }

    const excluded = Array.isArray(decoratorsToExclude)
      ? decoratorsToExclude
      : [decoratorsToExclude];

    const symbols = excluded.map((dec) => dec?.symbol).filter(Boolean);

    Reflect.defineMetadata("excludedDecorators", symbols, target, propertyKey);
  };
}



export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let data = req?.user ? { user: req.user } : await populateuser(req, res);
    if (!data?.user) {
      return res
        .status(401)
        .json({
          message: "Authentication failed Try logging in ....",
          status: STATUS.NOUSER,
        });
    }
    if (!data.user.admin) {
      return res
        .status(401)
        .json({
          message: "This route is forbidden for users",
          status: STATUS.NOTADMIN,
        });
    }
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Authentication failed", status: STATUS.AUTHERROR });
    // next(error)
  }
};


export const verifyVerificationPinMiddw = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let user = req.user;
  let pin = req.headers["authpin"] as string;
  let keyId = req.headers["authkeyid"] as string;
  console.log(pin, keyId, "kekek", req.headers);
  // user: IUser;
  // pin: string;
  // keyId:string
  const session = await mongoose.startSession();

  try {
    let response;

    await session.withTransaction(async () => {
      // const { pin,user ,keyId} = data;

      //
      let key = await AuthService.handleGetAuthEncryptionPrivateKey({
        userId: "",
        keyId,
      });
      if (!key) {
        return res.status(500).json(ERRORSMG.AUTHORIZATION_ERROR);
      }
      console.log(key, "keykeykey", pin);
      let decryptedPin = await decryptMessageFromKeyPair({
        encrypted: pin,
        privateKey: key.privateKey,
      });

      console.log(decryptedPin, "decryptedPin");
      if (!user) {
        return res
          .status(500)
          .json({
            ...ERRORSMG.AUTHENTICATION_ERROR,
            message: "Please log in to continue",
          });
        // throw new Error("Please log in to continue");
      }
      if (!decryptedPin?.decrypted) {
        return res.status(500).json(ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
        // throw new Error("Please log in to continue");
      }
      let hasedpin = user.pin;

      console.log(hasedpin,user);
      const isMatch = await bcrypt.compare(decryptedPin?.decrypted, hasedpin);
      console.log(isMatch);
      if (!isMatch) {
        return res.status(500).json(ERRORSMG.INVALID_CREDENTIALS);
      }
      //       const newUser =  await User.updateOne({
      // _id:new Types.ObjectId(user._id.toString())
      //       },{$set:{pin:hashedPin,pinAdded:true}});

      // response = {
      //   success: true,
      //   message: "Pin Added Successfully.",

      // };

      next();
    });

    return response;
  } catch (err: any) {
    console.error(err);
    return res.status(500).json(ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
    // throw new Error("Something went wrong");
  } finally {
    session.endSession();
  }
};
export const DECORATORS = {
  authenticate: {
    function: authenticateNoSecret,
    symbol: Symbol("authenticate"),
  },
  verifyAuthPin: {
    function: verifyVerificationPinMiddw,
    symbol: Symbol("verifyAuthPin"),
  },
  authenticateAdmin: {
    function: authenticateAdmin,
    symbol: Symbol("authenticateAdmin"),
  },
  authenticateNoSecret: {
    function: authenticateNoSecret,
    symbol: Symbol("authenticateNoSecret"),
  },


  // FillUser:{function:FillUser,symbol:Symbol("FillUser")},
};

export const FillUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const authHeader = req.headers.authorization

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return res.status(401).json({ message: "Authentication required" })
    // }

    // const token = authHeader.split(" ")[1]

    // if (!token) {
    //   return res.status(401).json({ message: "Authentication required" })
    // }

    // try {
    //   const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: string }

    //   // Get user from database
    //   const user = await User.findById(decoded.userId)

    //   // if (!user) {
    //   //   return res.status(401).json({ message: "Authentication failed" })
    //   // }

    //   // Attach user to request
    //   req.user = user
    //   next()
    // } catch (error) {
    //   return res.status(401).json({ message: "Authentication failed" })
    // }

    await populateuser(req, res);
  } catch (error) {
  } finally {
    next();
  }
};


export const populateuser = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
  // // throw({ message: "Authentication required",status:STATUS.NOTAUTHTOKEN })
  //   }

  const bearer = authHeader?.split(" ")[1];
  if(!bearer ){
    return null;
  }
  const bearersplit = bearer.split("123456789");
  const token = bearersplit[0];
  const authKey = bearersplit[1];

  let v = await getUserWithToken({ token, authKey });
  // if(v.user){

  // }
  // v. authKey=v?.authKey
  // v. authKeyData=v?.authKeyData||{}
  // v.user.authKey=v.authKey
  // v.user.authKeyData=v.authKeyData
  // v.authKeyData = v.authKeyData
  let user_ = v.user;
  // user_.authKeyData =v?.authKeyData||{}
  req.user = user_;
  //  req.
  return v;
};


export let getUserWithToken = async ({
  token,
  authKey,
}: {
  token: string;
  authKey: string;
}) => {
  let data: any = { user: null, accessCode: null };

  if (token) {
    try {
      let decoded = undefined;

      try {
        decoded = jwt.verify(token, config.jwtSecret || "secret") as {
          userId: string;
          accessToken: string;
        };
      } catch (e) {
        console.log(e, "jwterror");
      }
      let privyuser: any;

      let user = null;

      user = await User.findById(new Types.ObjectId(decoded?.userId));
      // if(privyuser){

      //   user = await User.findOneAndUpdate({$or:[{privyId:privyuser?.id},{email:privyuser.email}]} ,{privyId:privyuser?.id,email:privyuser.email},{new:true,upsert:true,returnDocument: 'after'})
      // }else if(decoded) {

      // }

      if (user) {
        data.user = user;
      }

      //   const redisKey =
      //   // authPkgKey ? `redisAuthPkgKey_${authPkgKey}_${data.user._id}`:
      //   `${authKey}_${data.user._id}`
      //  let authKey_ ;
      //  try{

      //    authKey_ = await redis.get(redisKey)

      //    data.authKey =!!( authKey_  && authKey_ != "" )
      //    if(data.authKey){

      //      let decodedauthKey = jwt.verify(authKey_, config.jwtSecret || "secret") as any

      //      data.authKeyData =decodedauthKey?.data
      //      user.authKeyData=decodedauthKey?.data?.data

      //    }
      //  }catch(e){

      //  }

      // if (!user) {
      //   return res.status(401).json({ message: "Authentication failed" })
      // }

      // Attach user to request
      // if(req){

      //   req.user = user
      // }
    } catch (e) {
      console.log(e);
    }
  }

  return data;
};


type MiddlewareFn = (req: any, res: any, next: any) => void;

// export function UseMiddleware(...middlewares: any[]) {
//   return function (target: any,     propertyKey: string | symbol,descriptor: any) {
//     // let middlewares = middlewaresArrays.map(e=>{
//     //   return DECORATORS[e]
//     // })
//     console.log(target,propertyKey,descriptor,"desmmm",middlewares

//     )
//       const excluded: symbol[] = Reflect.getMetadata('excludedDecorators', target, propertyKey) || [];

//     if (excluded.includes(EXCLUDE_ALL) ) {
//       console.log(`Skipping SomeDecorator on ${propertyKey.toString()}`);
//       return;
//     }
//     const originalMethod = descriptor.value;
//     descriptor.value = function (...args: any[]) {
//       const [req, res, next] = args; // Express request, response, next function

//       let index = 0;

//       const runMiddleware = (err?: any) => {
//         if (err) return next(err); // If any middleware returns an error, stop execution

//         const middleware = middlewares[index++];
//         if (middleware) {
//             if ( excluded.includes(middleware?.symbol)) {
//       console.log(`Skipping SomeDecorator on ${propertyKey.toString()}`);
//      return
//     }
//           middleware?.function(req, res, runMiddleware); // Execute next middleware
//         } else {
//           originalMethod.apply(this, args); // Call the original method after all middlewares
//         }
//       };

//       runMiddleware();
//     };
//     return descriptor;
//   };
// }

export function UseMiddleware(...middlewares: any[]): MethodDecorator {
  return function (target, propertyKey, descriptor: PropertyDescriptor) {
    const excluded: symbol[] =
      Reflect.getMetadata("excludedDecorators", target, propertyKey) || [];

    if (excluded.includes(EXCLUDE_ALL)) {
      console.log(
        `Skipping all middlewares on ${propertyKey.toString()} due to excludeAll`,
      );
      return descriptor; // Important to return descriptor so method stays intact
    }

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const [req, res, next] = args; // Express req, res, next

      let index = 0;

      const runMiddleware = (err?: any) => {
        if (err) return next(err);

        if (index >= middlewares.length) {
          return originalMethod.apply(this, args);
        }

        const middleware = middlewares[index++];

        if (!middleware || !middleware.function) {
          // Skip invalid middleware
          return runMiddleware();
        }

        if (excluded.includes(middleware.symbol)) {
          console.log(
            `Skipping middleware ${middleware.symbol.toString()} on ${propertyKey.toString()}`,
          );
          return runMiddleware(); // skip this middleware and continue
        }

        // Call middleware function with (req, res, next)
        middleware.function(req, res, runMiddleware);
      };

      runMiddleware();
    };

    return descriptor;
  };
}

export function UseGlobalMiddleware(...middlewares: any[]) {
  return function (target: any) {
    Object.getOwnPropertyNames(target.prototype).forEach((methodName) => {
      if (methodName !== "constructor") {
        const descriptor = Object.getOwnPropertyDescriptor(
          target.prototype,
          methodName,
        );
        if (descriptor) {
          // console.log(middlewares,"sds")
          UseMiddleware(...middlewares)(
            target.prototype,
            methodName,
            descriptor,
          );
          Object.defineProperty(target.prototype, methodName, descriptor);
        }
      }
    });
  };
}

// erv =  encrypted request value
export async function decryptBodyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Decrypt body if it exists
    if (req.body && req.body.erv) {
      console.log(req.body.erv.encryptedKey);
      let key = await decryptMessageFromKeyPair({
        encrypted: req.body.erv.encryptedKey,
      });
      // console.log(key)
      console.log(req.body.erv.encryptedBody);
      let data = await handleDecrypt({
        encrypted: req.body.erv.encryptedBody,
        passphrase: key.decrypted,
      });
      // console.log(data)
      req.body = JSON.parse(data);
      console.log(req.body);
    }

    // Decrypt query params if they exist
    if (req.query && typeof req.query.erv === "string") {
      let d = await decryptMessageFromKeyPair({
        encrypted: (req.query as any).erv,
      });
      req.query = JSON.parse(d.decrypted);
      console.log(req.query);
    }
  } catch (err) {
    console.error("Decryption failed:", err);
    return res.status(400).json({ error: "Invalid encrypted payload" });
  }

  next();
}
