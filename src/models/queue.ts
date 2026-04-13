
import mongoose, { Connection, type Document, Schema } from "mongoose"
import { E_DEV_ENVIRONMENT } from "../enums"

const QueueModelName ="Queue"
export interface IQueueModel extends Document {


  type:String
  status:String
  reference:String
  provider:String
  
  payload:any
  attempts:number
  nextRetryAt:Date
  environment:String
  createdAt:Date
}

const QueueSchema = new Schema<IQueueModel>({
  type: { type: String, required: true }, // TRANSACRION
  payload: { type: Object, required: true },
  environment:{type:String,enum:E_DEV_ENVIRONMENT},
  status: { type: String, default: "PENDING" },
  provider: { type: String },
  reference: { type: String ,required:true,unique:true},
  attempts: { type: Number, default: 0 },
  nextRetryAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});


export const QueueModel = mongoose.model<IQueueModel>(QueueModelName, QueueSchema)

export const getQueueModel = (conn: Connection|"main") => {

  // let conn: Connection = context.db
  return conn=="main"?QueueModel:(conn.models[QueueModelName] || conn.model<IQueueModel>(QueueModelName, QueueSchema)) 
  ;
};