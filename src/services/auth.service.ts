import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { IUser, Ref, User } from "../models/user"
import { config } from "../config"
import { EmailService } from "./email.service"
import {  GOOGLE_REDIRECT_URI, OTPTYPE, production, STATUS } from "../constant"
// import { OtpService } from "../otp/service"
import { OAuth2Client } from 'google-auth-library';
import mongoose, { Types } from "mongoose"
// import { WalletService } from "./wallet.service"
import { OtpService } from "./otp.service"
import _ from "lodash"
import * as yup from 'yup';
// import { generateUniqueNumericCode } from "../utils"
import axios from "axios";
import { Settings } from "../models/settings"
import { buildPath, generateUsername, manageGeneralError, recordRateAttempt, validateInput } from "../utils/utils"
import { UserAuth } from "../models/userauth"
import crypto, { randomUUID } from "crypto";
import { decryptMessageFromKeyPair, encryptMessageFromKeyPair, generateCustomKeyPair, handleDecrypt } from "../cryptic"
import { redis } from "./redis.service"

import { ERRORSMG } from "../error/error"
import { INodes, NodesModel } from "../models/node"
import { registerSchema } from "src/validators/auth"
// import { ProjectCollaborator } from "../models/collaborators"
// import { AccesscodeService } from "./accesscode.service"
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const MAX_KEYS = 5;
const KEY_TTL_MS = 5 * 60 * 1000; // 5 minutes

const GITHUB_CLIENT_ID =production? process.env.GITHUB_CLIENT_ID!:process.env.TEST_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = production?process.env.GITHUB_CLIENT_SECRET!:process.env.TEST_GITHUB_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = production ? process.env.GOOGLE_CLIENT_ID :process.env.TEST_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = production?process.env.GOOGLE_CLIENT_SECRET:process.env.TEST_GOOGLE_CLIENT_SECRET;
// const GOOGLE_REDIRECT_URI = `${DOMAIN}/auth/google/callback`;
const userpick = [
  "firstname","lastname","privateKey","email","_id","createdAt","updatedAt","emailIsVerified","biodatafilled","secretPhrase","pinAdded","rootnode"
]
const userpick2 = [
  "firstname","lastname","privateKey","email","_id","createdAt","updatedAt","emailIsVerified","biodatafilled","pinAdded",
]
const biodataSchema = yup.object({
  firstname: yup.string().required("firstame is required").min(3, "Name must be at least 3 characters"),
  lastname: yup.string().required("lastname is required").min(3, "Name must be at least 3 characters"),
  country: yup.string().required("country is required"),
  accountType: yup.string().required("accountType is required").min(3, "accountType must be at least 3 characters"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  // phone: yup.number().integer().min(18, "Must be at least 18").required("Age is required"),
  phone: yup.number().integer().required("phone is required"),
  // password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});
export class AuthService {
  static generateToken = ({userId,accessToken,data={}}:{userId: string,accessToken?:string,data?:any}) => {
 
    return jwt.sign({ userId:userId.toString() ,accessToken,data}, config.jwtSecret, { expiresIn: (config.jwtExpiresIn ) })
  }

  static getUserPublickey = async (id:string)=>{
    let {publicKey,privateKey} = generateCustomKeyPair()
    await UserAuth.findOneAndUpdate({
      _id: new Types.ObjectId(id)

    },{
      $setOnInsert:{

      }
    },{upsert:true,returnDocument:"after"})
  }
// static githubcallback = async ({code,ref}:{code:string,ref?:string})=>{

//   // const code = .code as string;

//   try {
//     // Step 3: Exchange code for access token
//     const tokenRes = await axios.post(
//       "https://github.com/login/oauth/access_token",
//       {
//         client_id: GITHUB_CLIENT_ID,
//         client_secret: GITHUB_CLIENT_SECRET,
//         code,
//       },
//       { headers: { Accept: "application/json" } }
//     );

//     const access_token = tokenRes.data.access_token;
//     // console.log

//     // Step 4: Get user profile
//     const userRes = await axios.get("https://api.github.com/user", {
//       headers: { Authorization: `Bearer ${access_token}` },
//     });

//     const user = userRes.data;
   

//     // Store user in session (or issue JWT for frontend)
//     // req.user = user;
//       const SGId = await generateAccountNumber();
//     let names =  user.name.split(" ")
//       const hashedPassword = await bcrypt.hash(Math.random().toString(), 12)
//        const newUserData = {
//         email:user.email,
//         password: hashedPassword,
//         lastname:names[0],
//         firstname:names[1]||names[0],
//           type:"github",
//           SGId,
//         // authType:""
 
//         emailIsVerified: true,
//          username:generateUsername(names[0]),
//         //  secretPhrase:"secret_"+generateUsername(names[0]),
//         biodatafilled: true,
//           //  ...(ref?{ref:new Types.ObjectId(ref)}:{})
     
//       }
  

//         const newUser = await User.findOneAndUpdate(
//     { email: user.email },
//     { $setOnInsert: newUserData , ...(ref && {
//       $set: {
//         invitee: { $ifNull: ["$invitee", new Types.ObjectId(ref)] },
//       },
//     }),}, // only set these if inserting
//     { upsert: true, new: true,returnDocument:"after" } // create if not found, return new doc
//   );

//          const [sgnubanRaw] = await SGNubanRegisterModel.create(
//       [
//         {
//           // bankRegister: bankRegister._id,
//           user: newUser._id,
//           isMain: true,
//           SGId,
//         },
//       ],
//       { session }
//     );

// if(ref){

//   await Ref.findOneAndUpdate(
//   { user: new Types.ObjectId(ref),  $inc: { credit: 5 } },
//   {
//     $set: { user: new Types.ObjectId(ref) },
//     $inc: { credit: 10, totalInvitees:1},
//   },
//   { upsert: true, returnDocument: "after" }
// );
// await Ref.findOneAndUpdate(
//   { user: newUser._id },
//   {
//     $set: { user: newUser._id},
//     $inc: { credit: 5 ,totalInvitees:1},
//   },
//   { upsert: true, returnDocument: "after" }
// );
// }
//     const   token  =this.generateToken({userId:newUser._id.toString(),data:{authType:"github",githubToken:access_token}})


//  return { success:true,token, user:_.pick({...newUser.toObject(),secretPhrase:!!newUser.secretPhrase},userpick) };
//   } catch (err) {
//     console.log("error login in with github",err,)
//     throw ({ error: "OAuth failed", details: err });
//   }

// }
static githubcallback = async ({ code, ref }: { code: string; ref?: string }) => {
  const session = await mongoose.startSession();

  try {
    let response;

    await session.withTransaction(async () => {
      const tokenRes = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        },
        { headers: { Accept: "application/json" } }
      );

      const access_token = tokenRes.data.access_token;

      const userRes = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const user = userRes.data;

  
      let names = user.name.split(" ");
      const hashedPassword = await bcrypt.hash(Math.random().toString(), 12);

      const newUserData = {
        email: user.email,
        password: hashedPassword,
        lastname: names[0],
        firstname: names[1] || names[0],
        type: "github",
    
        emailIsVerified: true,
        username: generateUsername(names[0]),
        biodatafilled: true,
      };

      const newUser = await User.findOneAndUpdate(
        { email: user.email },
        {
          $setOnInsert: newUserData,
          ...(ref && {
            $set: {
              invitee: { $ifNull: ["$invitee", new Types.ObjectId(ref)] },
            },
          }),
        },
        { upsert: true, new: true, returnDocument: "after", session }
      );

  const node:INodes = await NodesModel.findOneAndUpdate(
      {

        user: new Types.ObjectId(newUser?._id?.toString()),
      },{
        
        setOnInsert:{
 
 
    // _id: new Types.ObjectId(newUser?._id?.toString()),
    isMain:true,
    title:"main",
    description:"the default node of the user",
     path:"/"
        
      }
      },{session ,new:true,upsert:true});
      if(node){

        node.path = buildPath(null, node._id);
    await node.save();
      }
      if (ref) {
        await Ref.findOneAndUpdate(
          { user: new Types.ObjectId(ref) },
          {
            $set: { user: new Types.ObjectId(ref) },
            $inc: { credit: 10, totalInvitees: 1 },
          },
          { upsert: true, returnDocument: "after", session }
        );

        await Ref.findOneAndUpdate(
          { user: newUser._id },
          {
            $set: { user: newUser._id },
            $inc: { credit: 5, totalInvitees: 1 },
          },
          { upsert: true, returnDocument: "after", session }
        );
      }

      const token = this.generateToken({
        userId: newUser._id.toString(),
        data: { authType: "github", githubToken: access_token },
      });

      response = {
        success: true,
        token,
        user: _.pick(
          { ...newUser.toObject(), secretPhrase: !!newUser.secretPhrase },
          userpick
        ),
      };
    });

    return response;
  } catch (err) {
    console.log("error login in with github", err);
    throw { error: "OAuth failed", details: err };
  } finally {
    session.endSession();
  }
};

// static googlecallback = async ({code,ref}:{code:string,ref?:string})=>{

//   // const code = req.query.code;
// // const REDIRECT_URI = "http://localhost:4000/auth/google/callback";
//   try {
//     // Exchange code for tokens
//     const tokenRes = await axios.post("https://oauth2.googleapis.com/token", null, {
//       params: {
//         client_id: GOOGLE_CLIENT_ID,
//         client_secret: GOOGLE_CLIENT_SECRET,
//         code,
//         grant_type: "authorization_code",
//         redirect_uri: GOOGLE_REDIRECT_URI,
//       },
//     });

//     const { id_token, access_token } = tokenRes.data;

//     // Get user info from Google
//     const userRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
//       headers: { Authorization: `Bearer ${access_token}` },
//     });

//     const googleUser = userRes.data;

//     // Here you would create/find the user in DB
//     // Instead we create a JWT for frontend


//     // Redirect back to Next.js with token
//         let names =  googleUser.name.split(" ")
//       const hashedPassword = await bcrypt.hash(Math.random().toString(), 12)
//       // let existingUser = User.findOne({email:email})
//       //  const newUser = new User({
//       //   email:googleUser.email,
//       //   password: hashedPassword,
//       //   lastname:names[0],
//       //   firstname:names[1]||names[0],
//       //   // authType:""
 
//       //   emailIsVerified: true,
//       //   biodatafilled: true,
     
//       // })
//  const SGId = await generateAccountNumber();
//         const newUserData = {
//     email: googleUser.email,
//     type:"google",
//     password: hashedPassword,
//     lastname: names[0],
//     firstname: names[1] || names[0],
//     emailIsVerified: true,
//     biodatafilled: true,
//      username:generateUsername(names[0]),
//      SGId
     

    
//   };

//   const newUser = await User.findOneAndUpdate(
//     { email: googleUser.email },
    
//     { $setOnInsert: newUserData , ...(ref && {
//       $set: {
//         invitee: { $ifNull: ["$invitee", new Types.ObjectId(ref)] },
//       },
//     }),}, // only set these if inserting
//     { upsert: true, new: true,returnDocument:"after" } // create if not found, return new doc
//   );


//    const [sgnubanRaw] = await SGNubanRegisterModel.create(
//       [
//         {
//           // bankRegister: bankRegister._id,
//           user: newUser._id,
//           isMain: true,
//           SGId,
//         },
//       ],
//       { session }
//     );

// if(ref){

//   await Ref.findOneAndUpdate(
//   { user: new Types.ObjectId(ref),  $inc: { credit: 5 } },
//   {
//     $set: { user: new Types.ObjectId(ref) },
//     $inc: { credit: 10, totalInvitees:1},
//   },
//   { upsert: true, returnDocument: "after" }
// );
// await Ref.findOneAndUpdate(
//   { user: newUser._id },
//   {
//     $set: { user: newUser._id},
//     $inc: { credit: 5 ,totalInvitees:1},
//   },
//   { upsert: true, returnDocument: "after" }
// );
// }
//     const   token  =this.generateToken({userId:newUser._id.toString(),data:{authType:"google",githubToken:access_token}})


//  return { success:true,token, user:_.pick({...newUser.toObject(),secretPhrase:!!newUser.secretPhrase},userpick) };
//   // return (`http://localhost:3000/auth/success?token=${appToken}`);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
// throw ("Authentication failed");
//   }

// }

static googlecallback = async ({ code, ref }: { code: string; ref?: string }) => {
  const session = await mongoose.startSession();

  try {
    let response;

    await session.withTransaction(async () => {
      const tokenRes = await axios.post(
        "https://oauth2.googleapis.com/token",
        null,
        {
          params: {
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: GOOGLE_REDIRECT_URI,
          },
        }
      );

      const { access_token } = tokenRes.data;

      const userRes = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const googleUser = userRes.data;

      let names = googleUser.name.split(" ");
      const hashedPassword = await bcrypt.hash(Math.random().toString(), 12);
    

      const newUserData = {
        email: googleUser.email,
        type: "google",
        password: hashedPassword,
        lastname: names[0],
        firstname: names[1] || names[0],
        emailIsVerified: true,
        biodatafilled: true,
        username: generateUsername(names[0]),
   
      };

      const newUser = await User.findOneAndUpdate(
        { email: googleUser.email },
        {
          $setOnInsert: newUserData,
          ...(ref && {
            $set: {
              invitee: { $ifNull: ["$invitee", new Types.ObjectId(ref)] },
            },
          }),
        },
        { upsert: true, new: true, returnDocument: "after", session }
      );

  const node = await NodesModel.findOneAndUpdate(
      {

        user: new Types.ObjectId(newUser?._id?.toString()),
      },{
        
        $setOnInsert:{
 
 
    // _id: new Types.ObjectId(newUser?._id?.toString()),
    isMain:true,
    title:"main",
    description:"the default node of the user",
     path:"/"
        
      }
      },{ upsert: true, returnDocument: "after", session });
        if(node){

        node.path = buildPath(null, node._id);
    await node.save({session});
      }
 newUser.rootnode =node._id as Types.ObjectId;

       await newUser.save({ session });
      if (ref) {
        await Ref.findOneAndUpdate(
          { user: new Types.ObjectId(ref) },
          {
            $set: { user: new Types.ObjectId(ref) },
            $inc: { credit: 10, totalInvitees: 1 },
          },
          { upsert: true, returnDocument: "after", session }
        );

        await Ref.findOneAndUpdate(
          { user: newUser._id },
          {
            $set: { user: newUser._id },
            $inc: { credit: 5, totalInvitees: 1 },
          },
          { upsert: true, returnDocument: "after", session }
        );
      }

      const token = this.generateToken({
        userId: newUser._id.toString(),
        data: { authType: "google", googleToken: access_token },
      });

      response = {
        success: true,
        token,
        user: _.pick(
          { ...newUser.toObject(), secretPhrase: !!newUser.secretPhrase },
          userpick
        ),
      };
    });

    return response;
  } catch (err) {
    console.error(err,"Errrrrrrvvd",(err as any)?.message,code);
    throw "Authentication failed";
  } finally {
    session.endSession();
  }
};


//   static signupUser = async (data: { email: string; password: string; firstname: string; lastname: string,ref?:string|null }) => {
//     const { email, password, firstname, lastname,ref } = data

//     try {
//       const existingUser = await User.findOne({ email })

//       if (existingUser) {
//         throw new Error("User already exists")
//       }

//       const hashedPassword = await bcrypt.hash(password, 12)
//        const SGId = await generateAccountNumber();
//       const newUser = new User({
//         email,
//         SGId,
//         password: hashedPassword,
//         type:"email",
//         username:generateUsername(firstname),
//         lastname,
//         firstname,
//         ...(ref?{invitee:new Types.ObjectId(ref)}:{})
      
    
     
   
//       })
//         const [sgnubanRaw] = await SGNubanRegisterModel.create(
//       [
//         {
//           // bankRegister: bankRegister._id,
//           user: newUser._id,
//           isMain: true,
//           SGId,
//         },
//       ],
//       { session }
//     );

// if(ref){

// await Ref.findOneAndUpdate(
//   { user: new Types.ObjectId(ref) },   // query must be clean
//   {
//     $set: { user: new Types.ObjectId(ref) },
//     $inc: { credit: 10, totalInvitees: 1 },
//   },
//   { upsert: true, returnDocument: "after" }
// );

// await Ref.findOneAndUpdate(
//   { user: newUser._id },
//   {
//     $set: { user: newUser._id },
//     $inc: { credit: 5, totalInvitees: 1 },
//   },
//   { upsert: true, returnDocument: "after" }
// );

// }

//       await newUser.save()

//       // Send verification email
//       await EmailService.sendVerificationEmail(email)

//       const token = this.generateToken({userId:newUser._id as any})

//       return {success:true, message: "User created successfully. Please verify your email.", token,user:_.pick({...newUser.toObject(),secretPhrase:!!newUser.secretPhrase},userpick) }
//     } catch (err: any) {
//       console.error(err)
//       throw new Error(err.message || "Server error")
//     }
//   }

static signupUser = async (data: {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  ref?: string | null;
}) => {
  const session = await mongoose.startSession();

  try {
    validateInput({schema:registerSchema,input:data})
    let response;

    await session.withTransaction(async () => {
      const { email, password, firstname, lastname, ref } = data;

      const existingUser = await User.findOne({ email }).session(session);
      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 12);
  
      const newUser = new User({
        email,
  
        password: hashedPassword,
        type: "email",
        username: generateUsername(firstname),
        lastname,
        firstname,
        ...(ref ? { invitee: new Types.ObjectId(ref) } : {}),
      });

     

  const [node] = await NodesModel.create([{
      
        user: new Types.ObjectId(newUser?._id?.toString()),
  // _id: new Types.ObjectId(newUser?._id?.toString()),
  isMain:true,
  title:"main",
  description:"the default node of the user",
  path:"/"
      }],{session});

  if(node){

        node.path = buildPath(null, node._id);
    await node.save({session});
      }
      newUser.rootnode =node._id as Types.ObjectId;

       await newUser.save({ session });

      if (ref) {
        await Ref.findOneAndUpdate(
          { user: new Types.ObjectId(ref) },
          {
            $set: { user: new Types.ObjectId(ref) },
            $inc: { credit: 10, totalInvitees: 1 },
          },
          { upsert: true, returnDocument: "after", session }
        );

        await Ref.findOneAndUpdate(
          { user: newUser._id },
          {
            $set: { user: newUser._id },
            $inc: { credit: 5, totalInvitees: 1 },
          },
          { upsert: true, returnDocument: "after", session }
        );
      }

      await EmailService.sendVerificationEmail(email);

      const token = this.generateToken({
        userId: newUser._id.toString(),
      });

      response = {
        success: true,
        message: "User created successfully. Please verify your email.",
        token,
        user: _.pick(
          { ...newUser.toObject(), secretPhrase: !!newUser.secretPhrase },
          userpick
        ),
      };
    });

    return response;
  } catch (err: any) {
    // console.error(err);
    // throw new Error(err.message || "Server error");

     manageGeneralError(err, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  } finally {
    session.endSession();
  }
};


static handleGetAuthEncryptionKey = async (userId: string="") => {
  const redisKey = `pin_keys:${userId}`;
  const now = Date.now();
console.dir(redis.get,{depth:10})
  // 1️⃣ Fetch existing keys
  const raw:string = await redis.get(redisKey) as string;
  let keys: any[] = raw ? JSON.parse(raw) : [];

  // 2️⃣ Manual cleanup (expired)
  keys = keys.filter(k => k.expiresAt > now);

  // 3️⃣ Try to reuse a key that is NOT half-expired
  let selectedKey = keys.find(k => {
    const lifetime = k.expiresAt - k.createdAt;
    const age = now - k.createdAt;
    return age < lifetime / 2;
  });

  // 4️⃣ Only generate if NONE found or we are BELOW limit
  if (!selectedKey || keys.length < MAX_KEYS) {
    const { publicKey, privateKey } = generateCustomKeyPair();

   let  key = {
      keyId: randomUUID(),
      publicKey,
      privateKey,
      createdAt: now,
      expiresAt: now + KEY_TTL_MS
    };

    keys.push(key);
  }

  // 5️⃣ If still no key (limit reached), reuse the freshest one
  if (!selectedKey) {
    keys.sort((a, b) => b.createdAt - a.createdAt);
    selectedKey = keys[0];
  }

  // 6️⃣ Save back to Redis
  await redis.set(
    redisKey,
    JSON.stringify(keys),
    // "PX",
     {EX:KEY_TTL_MS }
    // "KEY_TTL_MS" // auto-expire safety
  );

  // 7️⃣ Return ONLY what client needs
  return {
    keyId: selectedKey.keyId,
    publicKey: selectedKey.publicKey,
    expiresAt: selectedKey.expiresAt
  };
};
static handleGetAuthEncryptionPrivateKey = async ({userId="",keyId}:{userId: string,keyId:string}) => {
  const redisKey = `pin_keys:${userId}`;
  const now = Date.now();

  // 1️⃣ Fetch existing keys
  const raw:string = await redis.get(redisKey) as string;
  let keys: any[] = raw ? JSON.parse(raw) : [];

  // 2️⃣ Manual cleanup (expired)
  // keys = keys.filter(k => k.expiresAt > now);

  // 3️⃣ Try to reuse a key that is NOT half-expired
  let selectedKey = keys.find(k => {
 return k.keyId = keyId;

  });
  return selectedKey

};


static createVerificationPin = async (data: {
  user: IUser;
  pin: string;
  keyId:string
  // firstname: string;
  // lastname: string;
  // ref?: string | null;
}) => {
  const session = await mongoose.startSession();

  try {
    let response;

    await session.withTransaction(async () => {
      const { pin,user ,keyId} = data;

      // 
let key =  await AuthService.handleGetAuthEncryptionPrivateKey({userId:"",keyId})
if(!key){
            throw (ERRORSMG.SOMETHING_WENT_WRONG_ERROR)
}
console.log(key,"keykeykey",pin)
  let decryptedPin =    await decryptMessageFromKeyPair({encrypted:pin,privateKey:key.privateKey})

      console.log(decryptedPin,"decryptedPin")
      if (!user) {
        throw ({...ERRORSMG.AUTHENTICATION_ERROR,message:"Please log in to continue"})
        // throw new Error("Please log in to continue");
      }
      if (!decryptedPin?.decrypted) {
        throw (ERRORSMG.SOMETHING_WENT_WRONG_ERROR)
        // throw new Error("Please log in to continue");
      }

      const hashedPin = await bcrypt.hash(decryptedPin?.decrypted, 12);
    

      const newUser =  await User.updateOne({
_id:new Types.ObjectId(user._id.toString())
      },{$set:{pin:hashedPin,pinAdded:true}});

  
      response = {
        success: true,
        message: "Pin Added Successfully.",
   
      };
    });

    return response;
  } catch (err: any) {
    console.error(err);
              throw (ERRORSMG.SOMETHING_WENT_WRONG_ERROR)
    // throw new Error("Something went wrong");
  } finally {
    session.endSession();
  }
};
static verifyVerificationPin = async (data: {
  user: IUser;
  pin: string;
  keyId:string
  // firstname: string;
  // lastname: string;
  // ref?: string | null;
}) => {
  const session = await mongoose.startSession();

  try {
    let response;

    await session.withTransaction(async () => {
      const { pin,user ,keyId} = data;

      // 
let key =  await AuthService.handleGetAuthEncryptionPrivateKey({userId:"",keyId})
if(!key){
            throw (ERRORSMG.SOMETHING_WENT_WRONG_ERROR)
}
console.log(key,"keykeykey",pin)
  let decryptedPin =    await decryptMessageFromKeyPair({encrypted:pin,privateKey:key.privateKey})

      console.log(decryptedPin,"decryptedPin")
      if (!user) {
        throw ({...ERRORSMG.AUTHENTICATION_ERROR,message:"Please log in to continue"})
        // throw new Error("Please log in to continue");
      }
      if (!decryptedPin?.decrypted) {
        throw (ERRORSMG.SOMETHING_WENT_WRONG_ERROR)
        // throw new Error("Please log in to continue");
      }
let hasedpin = user.pin
    
    
if (!hasedpin) {
         throw (ERRORSMG.INVALID_CREDENTIALS)
}
      const isMatch = await bcrypt.compare( decryptedPin?.decrypted,hasedpin)
      if (!isMatch) {
               throw (ERRORSMG.INVALID_CREDENTIALS)
      }
//       const newUser =  await User.updateOne({
// _id:new Types.ObjectId(user._id.toString())
//       },{$set:{pin:hashedPin,pinAdded:true}});

  
      response = {
        success: true,
        message: "Pin Added Successfully.",
   
      };
    });

    return response;
  } catch (err: any) {
    console.error(err);
              throw (ERRORSMG.SOMETHING_WENT_WRONG_ERROR)
    // throw new Error("Something went wrong");
  } finally {
    session.endSession();
  }
};


  static logout = async (data: { user:{authKey:string}}) => {
    const {user } = data

    try {
      let v = await redis.get(user?.authKey)
      if(v){

      await  redis.del(user?.authKey)
      }
     
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || "Server error")
      // throw (ERRORSMG.SOMETHING_WENT_WRONG_ERROR)
    }
  }




  
  //   static verifySecretPhrase = async (secret:string,userId:string) => {
  //   // const { email, password } = data

  //   try {
  //     const user = await User.findOne({_id:userId}) as IUser
  //     if (!user) {
  //       throw new Error("Invalid credentials")
  //     }
   
  //     const isMatch = await bcrypt.compare(secret, user.secretPhrase)
  //     if (!isMatch) {
  //       throw new Error("wrong password credentials")
  //     }

 

  //     // const token = this.generateToken({userId:(user._id.toString()) as any})
  //     return { message: "Login successful",success:true,user:_.pick({...user.toObject(),secretPhrase:!!user.secretPhrase},userpick)}
  //   } catch (err: any) {
  //     console.error(err)
  //     throw new Error(err.message || "Server error")
  //   }
  // }
  


    static productpopulate = [
     
      {
        path: "user",
        model: "User", 
      },
      {
        path: "project",
        model: "Product",
  
  populate:[
        {
        path: "user",
        model: "User", 
      },
  ]
        
        
  
      },
    ];



    static async verifyEmail(data: { otp: number; email: any }) {
    const { otp, email } = data

    try {
      const isValid = await OtpService.verifyOtp({
        otp,
        email: email,
        type: OTPTYPE.emailVerification,
      })

      if (!isValid) {
        throw new Error("Invalid or expired OTP.")
      }

      const user = await User.findOneAndUpdate({email}, {$set:{email,emailIsVerified:true}}, {
        new: true, // Return the updated or newly created document
        upsert: true, // Create if not found
        setDefaultsOnInsert: true, // Apply default values
      });

      // user.emailIsVerified = true
      // await user.save()
  
      return { message: "Email verified successfully",user:_.pick(user,userpick) }
    } catch (error: any) {
      console.error("Email verification error:", error)
      throw new Error(error.message || "Failed to verify email")
    }
  }
  static updateUserBiodata = async (data: { email: string;  firstname: string; lastname: string ,username:string},userId:string) => {
    const { email, firstname, lastname,username, } = data
    // try {
    //   // const validData = await biodataSchema.validate(data, { abortEarly: false });
    //   // console.log("Validation Success:", validData);
    // } catch (error:any) {
    //   // console.error("Validation Errors:", error.errors);
    // throw(new Error(error.errors[0]))
    // }
    try {
      // const existingUser = await User.findOne({ email,biodatafilled:false })
      const existingUser = await User.findOne({ _id:new Types.ObjectId(userId) })

      if (!existingUser) {
        throw new Error("User does not exists")
      }

      

      // const hashedPassword = await bcrypt.hash(password, 12)
      // const newUser = new User({
      //   email,
      //   // password: hashedPassword,
      //   lastname,
      //   firstname,
      //   emailIsVerified: false,
      // })


      existingUser.firstname = firstname ||existingUser.firstname
      existingUser.lastname = lastname ||existingUser.lastname
      existingUser.username = username||existingUser.username
      // existingUser.accountType = accountType
      // existingUser.phone = phone
      existingUser.biodatafilled = true
      await existingUser.save()

      // Send verification email
      // await EmailService.sendVerificationEmail(email)

      // const token = this.generateToken(newUser._id)

      return existingUser.toJSON()
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || "Server error")
    }
  }
static async updateUserSetting(
  data:Record<string,any>,
  userId: string
) {
  try {
    // Remove unwanted props
    data = _.omit(data, ["user"]);

    // Always ensure biodatafilled is true after update/create
    const updateData = {
      ...data,
    
    };

    // Find by id and update, or create if doesn't exist
    const user = await Settings.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $set: {...updateData,user: new Types.ObjectId(userId)} },
      { upsert: true, new: true } // create if not exists, return the new doc
    ).lean();

    return user;
  } catch (err: any) {
    console.error(err);
    throw new Error(err.message || "Server error");
  }}

 static async  getUserSetting(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  let setting = await Settings.findOne({ user: new Types.ObjectId(userId) });

  if (!setting) {
    // create new one with defaults
    setting = new Settings({
      user: new Types.ObjectId(userId),
    });
    await setting.save();
  }

  return setting;
}

  static authenticateUser = async (data: { email: string; password: string }) => {
    const { email, password } = data

    try {
      const user = await User.findOne({ email }) as IUser
      if (!user) {
        throw new Error("Invalid credentials")
      }
   
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        throw new Error("wrong password credentials")
      }

      // Check if email is verified
      // if (!user.emailIsVerified) {
      //   throw new Error("Email not verified. Please verify your email before logging in.")
      // }

      const token = this.generateToken({userId:(user._id.toString()) as any})
      return { message: "Login successful", token, user:_.pick({...user.toObject(),secretPhrase:!!user.secretPhrase},userpick) }
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || "Server error")
    }
  }

  static forgotPassword = async (data: { email: string }) => {
    const { email } = data

    try {
      const user = await User.findOne({ email })
      if (!user) {
        // For security reasons, still return success message even if user doesn't exist
        return { message: "If your email is registered, you will receive a password reset OTP." }
      }

      await EmailService.sendForgotPasswordEmail(email)
      return { message: "Password reset OTP sent to your email" }
    } catch (err: any) {
      console.error(err)
      throw new Error("Server error")
    }
  }

  static resetPassword = async (data: { otp: number; email: string; newPassword: string }) => {
    const { email, otp, newPassword } = data

    try {
      const user = await User.findOne({ email })
      if (!user) {
        throw new Error("Invalid email.")
      }

      const isValid = await OtpService.verifyOtp({ otp, email, type: OTPTYPE.forgotPassword })
      if (!isValid) {
        throw new Error("Invalid or expired OTP.")
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      user.password = hashedPassword
      await user.save()

      return { message: "Password successfully reset" }
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || "Server error")
    }
  }


 

  static async resendOtp(data: { email: string; type: OTPTYPE }) {
    const { email, type } = data

    try {
      const user = await User.findOne({ email })
      if (!user) {
        // For security reasons, still return success message even if user doesn't exist
        return { message: "If your email is registered, you will receive an OTP." }
      }

      if (type === OTPTYPE.emailVerification) {
        await EmailService.sendVerificationEmail(email)
      } else if (type === OTPTYPE.forgotPassword) {
        await EmailService.sendForgotPasswordEmail(email)
      }

      return { message: "OTP sent successfully" }
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      throw new Error(error.message || "Failed to resend OTP")
    }
  }
  static async sendUnboardedEmailOtp(data: { email: string; type: OTPTYPE }) {
    const { email, type } = data

    try {
      const user:any = await User.findOne({ email })
      if (user) {

        throw { message: "User already exist",status:STATUS.ERROR,user:user }
      }

      // if (type === OTPTYPE.emailVerification) {
        await EmailService.sendVerificationEmail(email)

  
        // if(usdcWallet){
        //   user.usdcWallet = usdcWallet
        // }
      // } else if (type === OTPTYPE.forgotPassword) {
        // await EmailService.sendForgotPasswordEmail(email)
      // }

      return { message: "OTP sent successfully" }
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      throw new Error(error.message || "Failed to resend OTP")
    }
  }






 


 static async findUsers({ title }: { title: string }) {
  let users = await User.find({
    $or: [
      { email: { $regex: title, $options: "i" } },     // case-insensitive match
      { username: { $regex: title, $options: "i" } },  // case-insensitive match
    ],
  });

  return users.map((e) => ({
    ..._.pick(e.toObject(), [
      "_id",
      "firstname",
      "lastname",
      "publicKey",
      "email",
      "username",

      
    ]),
  }));
}



    
}

