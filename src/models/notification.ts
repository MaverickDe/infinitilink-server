

import mongoose, { type Document, Schema } from "mongoose"
import { IUser } from "./user"

export enum NotificationType {
  LISTING = "LISTING",
  APPROVELISTING = "APPROVELISTING",
  REJECTLISTING = "REJECTLISTING",
  PROJECTINVITATIONREQUEST = "PROJECTINVITATIONREQUEST",
}

export interface INotification extends Document {
  user: IUser["_id"] // reference to User
  message?: string
  sessionId?: string
  head?: string
  adminMessage?: string
  adminHead?: string
  notificationType?: NotificationType
  dataId?: string
  createdAt: Date
  updatedAt: Date
  admin:boolean
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String },
    sessionId: { type: String },
    head: { type: String },
    adminMessage: { type: String },
    adminHead: { type: String },
    notificationType: { type: String, enum: Object.values(NotificationType) },
    dataId: { type: String },
    admin:{type:Boolean,default:true}
  },
  { timestamps: true }
)

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
)


export interface IUserNotificationStat extends Document {
  user: IUser["_id"]
  lastRead?: Date
  createdAt: Date
  updatedAt: Date
}

const userNotificationStatSchema = new Schema<IUserNotificationStat>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    lastRead: { type: Date },
  },
  { timestamps: true }
)

export const userNotificationStats = mongoose.model<IUserNotificationStat>(
  "UserNotificationStat",
  userNotificationStatSchema
)