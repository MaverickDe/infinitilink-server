import mongoose, { type Document, Schema, Types } from "mongoose"
import { E_ActionTypes } from "../enums";
import { convertEnumToList } from "../utils/utils";

const ActionsResponseModelName = "ActionResponse";

export interface IActionResponse extends Document {
  action: Types.ObjectId;
  resourceAction: Types.ObjectId;
  user?: Types.ObjectId;
isDeleted:boolean
  responseType: String;

  responsePayload: any;
    uniqueGroupId?: Types.ObjectId;
  normalized?: Record<string, any>;

  status: "pending" | "approved" | "rejected";

  createdAt: Date;
  updatedAt: Date;
}


const ActionResponseSchema = new Schema<IActionResponse>(
  {
    action: { type: Schema.Types.ObjectId, required: true },
    resourceAction: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId },

    responseType: {
      type: String,
      enum: convertEnumToList(E_ActionTypes),
      required: true,
    },
 uniqueGroupId: { type: Schema.Types.ObjectId },
    responsePayload: {
      type: Schema.Types.Mixed,
      required: true,
    },

    normalized: {
      type: Schema.Types.Mixed,
      default: {},
    },
        isDeleted: { 
      type: Boolean, 
      required: false, 
      default: false 
    }, 

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const ActionsResponseModel = mongoose.model<IActionResponse>(ActionsResponseModelName, ActionResponseSchema);
// CategoriesModel.createIndexes({ user: 1 });












const IActionUniqueFieldModalName = "ActionUniqueField";    

export interface IActionUniqueField extends Document {
  action: Types.ObjectId;
  field: string;
  value: string;
  compositeKey: string;
  isDeleted:boolean
      uniqueGroupId?: Types.ObjectId;
}


const ActionUniqueFieldSchema = new Schema<IActionUniqueField>(
  {
        isDeleted: { 
      type: Boolean, 
      required: false, 
      default: false 
    }, 
    action: { type: Schema.Types.ObjectId, required: true },
 uniqueGroupId: { type: Schema.Types.ObjectId },
    field: { type: String, required: true },

    value: { type: mongoose.Schema.Types.Mixed, required: true },

    compositeKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);


export const ActionUniqueFieldModel = mongoose.model<IActionUniqueField>(IActionUniqueFieldModalName, ActionUniqueFieldSchema);
// CategoriesModel.createIndexes({ user: 1 });

