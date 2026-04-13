import mongoose, { type Document, Schema, Types } from "mongoose"


export let BankModelName ="banks"

export interface IBank extends Document {
 

    _id: Types.ObjectId;
  bankId:String

  nipCode:String

  name:String
  cbnCode:String


}



export const BankSchema = new Schema<IBank>(
  {
   
  bankId:{type:String},

  nipCode:{type:String},

  name:{type:String},
  cbnCode:{type:String},

  },
  { timestamps: true },
)

export const BankModel = mongoose.model<IBank>(BankModelName, BankSchema)


