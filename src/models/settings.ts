import mongoose, { type Document, Schema } from "mongoose"
import { IUser } from "./user";
import { Notification, NotificationType } from "./notification";



export interface ISettings extends Document {
  twofactor: boolean
  notifications: boolean
  darkMode: boolean
  emailUpdates: boolean
  autoSync: boolean

//   description?: string
  user: IUser



  

}

const SettingsSchema = new Schema<ISettings>(
  {
    twofactor: { type: Boolean, default:false },
    notifications: { type: Boolean, default:true },
    darkMode: { type: Boolean, default:false },
    emailUpdates: { type: Boolean, default:false },
    autoSync: { type: Boolean, default:false },
    // description: { type: String, required: false },   
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

 

   
  },
  { timestamps: true },
)


export const Settings = mongoose.model<ISettings>("Settings", SettingsSchema)

