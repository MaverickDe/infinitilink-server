import mongoose, { type Document, Schema, Types } from "mongoose"
import { IUser } from "./user";


import { INodes, NodesModelName } from "./node";
import { convertEnumToList } from "../utils/utils";
import { ILinkGroup, LinkGroupModelName } from "./linkGroup";
export const  LinksModelName ="Links";


export enum E_LINK_CATEGORIES{
    MUSIC="MUSIC",
    OTHER="OTHER"
}
export interface ILinks extends Document {
  user: Types.ObjectId | IUser; // Can be ID or populated object
  url: String;
  title: String;
    logo?: String;
  isHidden: boolean;
  isPrivate: boolean;
  isFeatured: boolean;
  category: String; // Can be ID or populated object
  node: Types.ObjectId | INodes; // Can be ID or populated object
  anchor: Types.ObjectId | ILinks; // Can be ID or populated object
  group?: Types.ObjectId | ILinkGroup; // Can be ID or populated object
   Links: Number;
  clicks: Number;
  views: Number;
  position?: Number;
  comments: Number;
  likes: Number;
  description: String;



}

export let LinksGenericObj =  {
  
    url: { 
      type: String, 
    //   required: true, 
      
    },   
    logo: { 
      type: String, 
    //   required: true, 
      
    },   
    anchor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: LinksModelName, 
  
   
      
    },   
    title: { 
        type: String, 
        // required: true, 
   
 
    },   
    description: { 
      type: String, 
   
 
    },   
     
    category: { 
        type:String,
        enum:convertEnumToList(E_LINK_CATEGORIES),
        default:E_LINK_CATEGORIES.OTHER

    //   required: true 

 
    },   

    tags: [{
  type: String,
  lowercase: true,
  trim: true
}],
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
    isFeatured: { 
      type: Boolean, 
      required: false, 
      default: false 
    },   
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    node: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: NodesModelName, 
      required: true 
    },
    group: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: LinkGroupModelName, 
      default: null 
    },
     links: { 
      type: Number, 
      required: false, 
      default: 0 
    },   
      clicks: { 
      type: Number, 
      required: false, 
      default: 0 
    },  
      likes: { 
      type: Number, 
      required: false, 
      default: 0 
    },  
      views: { 
      type: Number, 
      required: false, 
      default: 0 
    },  
      position: { 
      type: Number, 
      required: false, 
       default: Date.now
     
    },  
      comments: { 
      type: Number, 
      required: false, 
      default: 0 
    },  

    

  }

const LinksSchema = new Schema<ILinks>(
LinksGenericObj ,
  { timestamps: true }
);
// Exporting the model
export const LinksModel = mongoose.model<ILinks>(LinksModelName, LinksSchema);
// LinksModel.createIndexes({ user: 1 });








