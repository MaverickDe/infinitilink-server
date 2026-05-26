import crypto from "crypto";
import { PaymentService } from "../services/payment.service";
import { redis } from "../services/redis.service";
// import { NubanCounterModel } from "../models/nubanCounter";
import { ERRORSMG } from "../error/error";
import { User } from "../models/user";
import { Types } from "mongoose";
import { QueueRegister } from "../jobs/jobs.register";

// Function to generate a salt
export function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString("hex"); // 16 bytes → 32 hex chars
}

export const buildPath = (parentPath: string | null, ownId: Types.ObjectId): string => {
  if (!parentPath) return `/${ownId}/`;
  return `${parentPath}${ownId}/`;
};


export function generateUsername(firstname: string): string {
  // Normalize the name
  const base = firstname
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // keep only letters/numbers

  // Add a short random suffix for uniqueness
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit number

  return `${base}${randomSuffix}`;
}
// export function generateHash(data: string) {
//   return crypto.createHash("sha256").update(data + Date.now()).digest("hex");
// }




// security/attemptLimiter.ts
// const emailAttempts = new Map(); // key: email, value: { count, lastAttempt }
// const deviceAttempts = new Map(); // key: deviceId or IP, value: { count, lastAttempt }

// const EMAIL_LIMIT = 4;
// const DEVICE_LIMIT = 10;
// const BLOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes block

// export function checkRateLimit({email, deviceId, ip,req,}:any) {
//   const now = Date.now();
//      deviceId = deviceId|| req.headers["x-device-id"];
//    ip =ip || req.ip;


//   // ---- EMAIL LIMIT ----
//   const emailEntry = emailAttempts.get(email) || { count: 0, lastAttempt: 0 };
//   if (emailEntry.blockedUntil && emailEntry.blockedUntil > now)
//     throw new Error("Too many wrong attempts. Try again later.");

//   // ---- DEVICE LIMIT ----
//   const deviceKey = deviceId || ip;
//   const deviceEntry = deviceAttempts.get(deviceKey) || { count: 0, lastAttempt: 0 };
//   if (deviceEntry.blockedUntil && deviceEntry.blockedUntil > now)
//     throw new Error("Device blocked due to too many failed attempts.");

//   return { emailEntry, deviceEntry, now, deviceKey };
// }

// export function recordRateAttempt({email, deviceKey, success, now,req}:any) {
//   deviceKey = deviceKey ||    req.headers["x-device-id"] ||  req.ip
//   // const ip = req.ip;
//   now = now||Date.now();
//   // console.log(deviceKey,email,success,now)

//   if (success) {
//     emailAttempts.delete(email);
//     deviceAttempts.delete(deviceKey);
//     return;
//   }

//   const emailEntry = emailAttempts.get(email) || { count: 0 };
//   console.log(email,emailEntry)
//   emailEntry.count++;
//   if (emailEntry.count >= EMAIL_LIMIT) {
//     emailEntry.blockedUntil = now + BLOCK_DURATION_MS;
//   }

//     const date = new Date(now + BLOCK_DURATION_MS);
// // console.log(date.toString());
//   emailAttempts.set(email, emailEntry);

//   const deviceEntry = deviceAttempts.get(deviceKey) || { count: 0 };
//   deviceEntry.count++;
//   if (deviceEntry.count >= DEVICE_LIMIT) {
//     deviceEntry.blockedUntil = now + BLOCK_DURATION_MS;
//   }
//   deviceAttempts.set(deviceKey, deviceEntry);
// }

type RateType = "auth" | "password-reset" | "comment" | string;

interface RateEntry {
  count: number;
  blockedUntil?: number;
  lastAttempt?: number;
}

// Top-level storage for all types
const emailAttemptsMap: Record<RateType, Map<string, RateEntry>> = {};
const deviceAttemptsMap: Record<RateType, Map<string, RateEntry>> = {};
const ipAttemptsMap: Record<RateType, Map<string, RateEntry>> = {};

const EMAIL_LIMIT = 4;
const DEVICE_LIMIT = 10;
const IP_LIMIT = 20; // Higher because IPs may be shared
const BLOCK_DURATION_MIN = 10;
const BLOCK_DURATION_MS = BLOCK_DURATION_MIN * 60 * 1000;

function getMapsForType(type: RateType) {
  if (!emailAttemptsMap[type]) emailAttemptsMap[type] = new Map();
  if (!deviceAttemptsMap[type]) deviceAttemptsMap[type] = new Map();
  if (!ipAttemptsMap[type]) ipAttemptsMap[type] = new Map();
  return {
    emailMap: emailAttemptsMap[type],
    deviceMap: deviceAttemptsMap[type],
    ipMap: ipAttemptsMap[type],
  };
}

export function checkRateLimit({
  email,
  deviceId,
  ip,
  req,
  type = "auth",
}: {
  email?: string;
  deviceId?: string;
  ip?: string;
  req?: any;
  type?: RateType;
}) {
  const now = Date.now();
  deviceId = deviceId || req?.headers["x-device-id"];
  ip = ip || req?.ip;

  const { emailMap, deviceMap, ipMap } = getMapsForType(type);

  // Check email
  if (email) {
    const entry = emailMap.get(email) || { count: 0 };
    if (entry.blockedUntil && entry.blockedUntil > now)
      throw new Error(
        `Too many wrong attempts for this email. Try again in ${BLOCK_DURATION_MIN} min.`
      );
  }

  // Check deviceId
  if (deviceId) {
    const entry = deviceMap.get(deviceId) || { count: 0 };
    if (entry.blockedUntil && entry.blockedUntil > now)
      throw new Error(
        `Device blocked due to too many failed attempts.`
      );
  }

  // Check IP
  if (ip) {
    const entry = ipMap.get(ip) || { count: 0 };
    if (entry.blockedUntil && entry.blockedUntil > now)
      throw new Error(
        `Too many requests from this IP. Try again later.`
      );
  }

  return { emailMap, deviceMap, ipMap, now };
}

export function recordRateAttempt({
  email,
  deviceId,
  ip,
  success,
  now,
  req,
  type = "auth",
}: {
  email?: string;
  deviceId?: string;
  ip?: string;
  success?: boolean;
  now?: number;
  req?: any;
  type?: RateType;
}) {
  now = now || Date.now();
  deviceId = deviceId || req?.headers["x-device-id"];
  ip = ip || req?.ip;

  const { emailMap, deviceMap, ipMap } = getMapsForType(type);

  if (success) {
    if (email) emailMap.delete(email);
    if (deviceId) deviceMap.delete(deviceId);
    if (ip) ipMap.delete(ip);
    return;
  }

  // Record email
  if (email) {
    const entry = emailMap.get(email) || { count: 0 };
    entry.count++;
    if (entry.count >= EMAIL_LIMIT) entry.blockedUntil = now + BLOCK_DURATION_MS;
    emailMap.set(email, entry);
  }

  // Record device
  if (deviceId) {
    const entry = deviceMap.get(deviceId) || { count: 0 };
    entry.count++;
    if (entry.count >= DEVICE_LIMIT) entry.blockedUntil = now + BLOCK_DURATION_MS;
    deviceMap.set(deviceId, entry);
  }

  // Record IP (long-term tracking)
  if (ip) {
    const entry = ipMap.get(ip) || { count: 0 };
    entry.count++;
    if (entry.count >= IP_LIMIT) entry.blockedUntil = now + BLOCK_DURATION_MS;
    ipMap.set(ip, entry);
  }
}


function luhnCheckDigit(num: string): number {
  let sum = 0;
  let shouldDouble = true;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (10 - (sum % 10)) % 10;
}

// import { CounterModel } from "../models/CounterModel";



export const manageGeneralError = (error: any,overideError?: any,returnobj?:boolean) => {
  console.dir(error, { depth: null, colors: true });
  if (error?.stq_controlled) {
    throw error;
  } else {
    // console.error("Unexpected error:", error);
    let e = overideError || ERRORSMG.GENERAL_ERROR
    if(returnobj){
      return e
    }
    throw e;
  }
}

// userSchema.parse(req.body);
export const validateInput = ({input,schema,async}:{input:any,schema:any,async?:boolean}) => {

  try{
  return async? schema.parseAsync(input): schema.parse(input)
  }
  catch(e:any){
    // try
   
   let errors  =  (e?.issues && [e?.issues[0]])?.map((issue:any)=>{
      return `${issue.path.join(".")}: ${issue.message}`})
    throw (overideObj(ERRORSMG.VALIDATION_ERROR,{message:errors||e?.errors? errors.join(", "):"validation error",errors:errors||[]}))
  }
  
}
export const validateInputAsync = async  (data:{input:any,schema:any,async?:boolean}) => {

  try{
  return  await validateInput(data)
  }
  catch(e:any){
    // try
   
   let errors  =  (e?.issues && [e?.issues[0]])?.map((issue:any)=>{
      return `${issue.path.join(".")}: ${issue.message}`})
    throw (overideObj(ERRORSMG.VALIDATION_ERROR,{message:errors||e?.errors? errors.join(", "):"validation error",errors:errors||[]}))
  }
  
}


export const manageReturnedError = ({error,overideError,res}:{res?:any,error: any,overideError?: any}) => {
  console.dir(error, { depth: null, colors: true });
   let e = overideError || ERRORSMG.GENERAL_ERROR
  // res.status(err.statusCode).json(err)
  if (error?.stq_controlled) {
    e = error;
  } 

  if(res){
    return res.status(e.statusCode).json(e)
  }

  return e
}

export const   overideObj =(error:any,obj={}) =>{
  return {...error,...obj}

}
// export const manageError = (error: any,overideError?: any,returnobj?:boolean) => {
//   if (error?.stq_controlled) {
//     throw error;
//   } else {
//     console.error("Unexpected error:", error);
//     let e = overideError || ERRORSMG.GENERAL_ERROR
//     if(returnobj){
//       return e
//     }
//     throw e;
//   }
// }


export async  function retrieveUser(req?:any){
  try{

    let user = req?.user
    if(user?.isRetrivedFromDb){
      return user
    }
    
    let dbUser = await User.findById(user?._id)
    if(!dbUser){
      return null
    }
    (dbUser as any).isRetrivedFromDb = true
    req.user = dbUser
    return dbUser 
  }catch(e){

    return null
    // console.log(e,"eeeeeeeeeeeeeeeeeeeee")
  }

}

export  function getOneAggregate(results: any[]) {
  console.log(results,"aggresults")
  // const results = await YourModel.aggregate(aggPipeline);
  return results[0] || null;
}



export const  convertEnumToList=(enumObj:any)=>{
 return Object.values(enumObj)as [
    string,
    ...string[]
  ];
}

export const convertEnumToList_logictwo = (enumObj: any): string[] => {
  return Object.values(enumObj).filter(
    (v) => typeof v === "string"
  );
};




export const populateRequiredObjV1 = ({ data, obj }: { data: any[]; obj: any }) => {
  const obj_: any = {};

  data.forEach((e) => {
    if (typeof e === "string") {
      if (obj[e] !== undefined) {
        obj_[e] = obj[e];
      }
    }

    if (typeof e === "object" && !Array.isArray(e)) {
      Object.entries(e).forEach(([key, fn]) => {
        if (obj[key] !== undefined && typeof fn === "function") {
          obj_[key] = fn(obj[key]);
        }
      });
    }
  });

  return obj_;
};


export const sortByPosition = <T extends { position?: number | null }>(arr: T[]) => {
  return [...arr].sort((a, b) => {
    const aPos = a?.position ?? Infinity;
    const bPos = b?.position ?? Infinity;

    return aPos - bPos;
  });
};


export const wouldCreateCycle = (
  movingNodeId: Types.ObjectId,
  newParentPath: string
): boolean => {
  return newParentPath.includes(`/${movingNodeId}/`);
};

// Escape special regex chars in path strings (IDs are hex, but be safe)
export const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

