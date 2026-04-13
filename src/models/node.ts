import mongoose, { type Document, Schema, Types } from "mongoose"
import { IUser } from "./user";


export const  NodesModelName ="Nodes";
export interface INodes extends Document {
  user: Types.ObjectId | IUser; // Can be ID or populated object
  _id: Types.ObjectId ; // Can be ID or populated object

  title: String;

  anchor: Types.ObjectId | INodes;
  node?: Types.ObjectId | INodes;
  description: String;
  links: Number;
  clicks: Number;
  views: Number;
  comments: Number;
  likes: Number;
  nodes: Number;
  logo?: String;
  isHidden: boolean;
  isPrivate: boolean;
  nodesIsVisible: boolean;
  isVisible: boolean;
  isMain: boolean;
path: string;


}

export let NodesGenericObj =  {
  
 
    logo: { 
      type: String, 
    //   required: true, 
      
    },   
    title: { 
        type: String, 
        required: true, 
   
 
    },   
  path: {
    type: String,
    required: true,
    default: "",
    index: true, // important for regex queries
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
    isMain: { 
      type: Boolean, 
      required: false, 
      default: false 
    },   
    links: { 
      type: Number, 
      required: false, 
      default: 0 
    },   
    nodes: { 
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
      comments: { 
      type: Number, 
      required: false, 
      default: 0 
    },  

       nodesIsVisible: { 
      type: Boolean, 
      required: false, 
      default: true 
    }, 
       isVisible: { 
      type: Boolean, 
      required: false, 
      default: true 
    }, 
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
        anchor: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: NodesModelName, 
       
       
          
        },  
        
           node: { 
              type: mongoose.Schema.Types.ObjectId, 
              ref: NodesModelName, 
         
            },

    

  }

const NodesSchema = new Schema<INodes>(
NodesGenericObj ,
  { timestamps: true }
);
// Exporting the model
export const NodesModel = mongoose.model<INodes>(NodesModelName, NodesSchema);
// NodesModel.createIndexes({ user: 1 });








