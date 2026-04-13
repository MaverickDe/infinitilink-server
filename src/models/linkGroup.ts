import mongoose, { type Document, Schema, Types } from "mongoose"
import { IUser } from "./user";
import { INodes, NodesModelName } from "./node";


export const  LinkGroupModelName ="LinkGroup";
export interface ILinkGroup extends Document {
  user: Types.ObjectId | IUser; // Can be ID or populated object

  title: String;


  node?: Types.ObjectId | INodes;
  description: String;
  isHidden: Boolean;
  isPrivate: Boolean;
  isVisibleInNode: Boolean;
 
 position?: Number;


}

export let LinkGroupGenericObj =  {
  
 
 
    title: { 
        type: String, 
        required: true, 
   
 
    },   
    description: { 
      type: String, 
   
 
    },   
     

  isHidden: { 
      type: Boolean, 
      required: false, 
      default: false 
    },   
    isPrivate: { 
      type: Boolean, 
      required: false, 
      default: false 
    }, 
    isVisibleInNode: { 
      type: Boolean, 
      required: false, 
      default: true 
    }, 
 
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
       position: { 
      type: Number, 
      required: false, 
       default: Date.now
     
    },  
        
           node: { 
              type: mongoose.Schema.Types.ObjectId, 
              ref: NodesModelName, 
         
            },

    

  }

const LinkGroupSchema = new Schema<ILinkGroup>(
LinkGroupGenericObj ,
  { timestamps: true }
);
// Exporting the model
export const LinkGroupModel = mongoose.model<ILinkGroup>(LinkGroupModelName, LinkGroupSchema);
// LinkGroupModel.createIndexes({ user: 1 });








