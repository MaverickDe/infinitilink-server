import mongoose, { type Document, Schema, Types } from "mongoose"
import { INodes, NodesModelName } from "./node";

export interface IUser extends Document {
   _id: Types.ObjectId;
  email: string
  bio: string
  username: string
    invitee?:IUser
    rootnode?:Types.ObjectId|INodes
  // _id: Types.ObjectId;
  firstname: string
  privyId: string
  lastname: string
  password: string
  type: string
 secretPhrase?:string
  country?: string
  accountType?: string
  phone?: string
  privateKey?: string
  publicKey?: string

  googleId?: string
  pin?: string
  pinAdded?: boolean
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  emailIsVerified: boolean
  onBoardGuide: boolean
  biodatafilled: boolean
  admin: boolean
  isVisibleInNode: boolean
    accessCode?: string
      salt?:string
      avatar?:string
  iv?:string
  authTag?:string
   SGId:string
 
}

export interface IRef extends Document{
  user:IUser
  credit:number
  totalInvitees:number
  // resolved:boolean
}

export const userSchema = new Schema<IUser>(
  {
      // accessCode: { type: String,required: false,unique:false },
    email: { type: String, required: true,unique: true  },
    username: { type: String, required: false,unique: true  },
    // privyId: { type: String, required: true, unique: true },
    firstname: { type: String, default: "" },
    avatar: { type: String},
    bio: { type: String,default:""},
    type: { type: String, default: "email" },
    lastname: { type: String, default: "" },
    admin: { type: Boolean, default: false },
    isVisibleInNode: { type: Boolean, default: true },
    password: { type: String },
    country: { type: String },
    accountType: { type: String },

    phone: { type: String },
    pin: { type: String },
    pinAdded: { type: Boolean },
    // secretPhrase: { type: String ,required:false,unique:false},
    //  SGId: { type: String ,required:true,unique:true},
    publicKey: { type: String },
    privateKey: { type: String },
         salt: { type: String },
     iv: { type: String,  },
     authTag: { type: String,  },
        invitee: { type: Schema.Types.ObjectId, ref: "User", required: false },
        rootnode: { type: Schema.Types.ObjectId, ref: NodesModelName, required: false },

    googleId: { type: String },
    emailIsVerified: { type: Boolean, default: false },
    onBoardGuide: { type: Boolean, default: false },
    biodatafilled: { type: Boolean, default: false },
 
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
 
  },
  { timestamps: true },
)

export const User = mongoose.model<IUser>("User", userSchema)


const refSchema = new Schema<IRef>(
  {
      credit: { type: Number,required: false,default:0 },
      totalInvitees: { type: Number,required: false,default:0 },
   user: { type: Schema.Types.ObjectId, ref: "User", required: true },


  })


  export const Ref = mongoose.model<IRef>("Ref", refSchema)
