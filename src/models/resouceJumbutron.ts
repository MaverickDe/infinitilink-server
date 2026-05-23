import mongoose, { type Document, Schema, Types } from "mongoose"



import { INodes, NodesModelName } from "./node";

import { ILinks, LinksModelName } from "./links";
import { ResourceJumbutronName } from "./general";




export interface IResourceJumbutron extends Document {

  isRedirect: boolean;
  isPopup: boolean;

  node: Types.ObjectId | INodes; // Can be ID or populated object
  resource: Types.ObjectId | ILinks; // Can be ID or populated object



}


const ResourceJumbutronSchema = new Schema<IResourceJumbutron>(
{
    isRedirect: { type: Boolean, default: false },  
    isPopup: { type: Boolean, default: false },
    node: { type: Schema.Types.ObjectId, ref: NodesModelName, required: true },
    resource: { type: Schema.Types.ObjectId, ref: LinksModelName, required: true },
} ,
  { timestamps: true }
);
// Exporting the model
export const ResourceJumbutronModel = mongoose.model<IResourceJumbutron>(ResourceJumbutronName, ResourceJumbutronSchema);
// LinksModel.createIndexes({ user: 1 });








