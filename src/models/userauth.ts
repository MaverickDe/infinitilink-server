import mongoose, { type Document, Schema } from "mongoose"
import { IUser } from "./user"

export interface IUserAuth extends Document {

    user?:IUser

  privateKey?: string
  username?: string
  email?: string
  pin?: string
  password?: string
  publicKey?: string
  authType?: string


 
}


const userSchema = new Schema<IUserAuth>(
  {
  
    username: { type: String,unique:true },
    password: { type: String },
    pin: { type: String },
    authType: { type: String },
    email: { type: String ,unique:true},
  
        user: { type: Schema.Types.ObjectId, ref: "User", required: false },

   
 
  },
  { timestamps: true },
)

export const UserAuth = mongoose.model<IUserAuth>("Userauth", userSchema)


