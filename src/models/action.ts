import mongoose, { type Document, Schema, Types } from "mongoose"
import { IUser } from "./user";
import { convertEnumToList } from "../utils/utils";
import e from "express";
import z from "zod";
import { E_ActionTypes } from "../enums";

export const  ActionsModelName ="Actions";
export const  ResouceActionName ="ResouceAction";

// export interface IActions extends Document {

//   name: String;
//   description: String;

// }


// export enum E_forminputType   
// {
//     text="text",
//     boolean="boolean",
//     number:"number",
//     email:"email",
//     phone:"phone",
//     date:"date",
//     datetime:"datetime"
// }
// const dataType= {
//     name:String,
//     canBeUnique:Boolean,
//     canEnforceEmailVerification:Boolean,
//     isOptional:Boolean,
//     type:E_forminputType

// }
// export const lookupInputExpandedRule { text:{name:"text"

//     canBeUnique:true,
// },boolean:{name:"boolean",} ,

// number:{name:"number", canBeUnique:true} ,email={
//    name: "email",
//      canBeUnique:true,
//      canEnforceEmailVerification:true,

// },phone={ name:"phone",canBeUnique:true,},date={name:"date"},datetime={name:"datetime"}}
// export let ActionsGenericObj =  {
//     name: { 
//       type: String, 
//       required: true, 
     
//       sparse: true // Important: Use sparse if alias is optional but unique
//     },   
//     description: { 
//       type: String, 
//       required: false, 
 
//     },  
//     actionType: { 
//         type:String,
//         enum:convertEnumToList(E_ActionTypes),
   

//     //   required: true 

//     ActionData:any

 
//     },  
    

//   }

// const ActionsSchema = new Schema<IActions>(
// ActionsGenericObj ,
//   { timestamps: true }
// );
// // Exporting the model
// export const ActionsModel = mongoose.model<IActions>(ActionsModelName, ActionsSchema);
// // CategoriesModel.createIndexes({ user: 1 });




export enum E_RESOURCE_LEVELS{
    NODE="node",
    LINK="link",
    USER="user",
    GROUP="group"

}

export const FieldTypeCapabilities = {
  text: {
    canBeUnique: false,
    canRequireVerification: false,
  },

  boolean: {
    canBeUnique: false,
    canRequireVerification: false,
  },

  number: {
    canBeUnique: true,
    canRequireVerification: false,
  },

  email: {
    canBeUnique: true,
    canRequireVerification: true,
  },

  phone: {
    canBeUnique: true,
    canRequireVerification: true,
  },

  date: {
    canBeUnique: false,
    canRequireVerification: false,
  },

  datetime: {
    canBeUnique: false,
    canRequireVerification: false,
  },
  select: {
    // list: ,
       canBeUnique: false,
    canRequireVerification: false,
  
  },
} as const;


export interface IActions extends Document {
  name: string;
  description?: string;

  user?: Types.ObjectId;



  actionType: E_ActionTypes;

  config: ActionConfig;
}
export interface IResouceAction extends Document {
 

  resource?: Types.ObjectId;
  action?: Types.ObjectId |IActions;
    user?: Types.ObjectId;
    uniqueGroupId?: Types.ObjectId;
      resourceType: E_RESOURCE_LEVELS;
      isDeleted?: boolean;



 
}

export interface  passwordActionConfig  {
      type: "password";
      passwordHash: string;
    }
export type ActionConfig =
  | {
      type: "password";
      passwordHash: string;
    }
  | {
      type: "formdata";
      fields: FormField[];
    }
  | {
      type: "geo";
      radius: number;
    }
  | {
      type: "request";
      endpoint: string;
    };



    export enum E_FormInputType {
  text = "text",
  boolean = "boolean",
  number = "number",
  email = "email",
  phone = "phone",
  date = "date",
  datetime = "datetime",
  select = "select",
}


export interface FormField {
  name: string;
  type: E_FormInputType;

  isOptional: boolean;
  isUnique: boolean;

  canEnforceEmailVerification?: boolean;
}




function validateField(field: FormField) {
  const cap = FieldTypeCapabilities[field.type];

  if (field.isUnique && !cap.canBeUnique) {
    throw new Error(
      `${field.type} cannot be marked as unique`
    );
  }

  return true;
}


const ActionsSchema = new Schema<IActions>(
  {
    name: { type: String, required: true },

    description: { type: String },

    actionType: {
      type: String,
      enum: convertEnumToList(E_ActionTypes),
      required: true,
    },
    user: { type: Schema.Types.ObjectId },
    config: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);
const ResouceActionSchema = new Schema<IResouceAction>(
  {

    isDeleted: { 
      type: Boolean, 
      required: false, 
      default: false 
    }, 
    resourceType: {
      type: String,
      enum: convertEnumToList(E_RESOURCE_LEVELS),
      required: true,
    },
    user: { type: Schema.Types.ObjectId },
    uniqueGroupId: { type: Schema.Types.ObjectId },
    resource: { type: Schema.Types.ObjectId },
    action: { type: Schema.Types.ObjectId ,
          ref: ActionsModelName 

    },

  },
  { timestamps: true }
);


const formFieldZod = z.object({
  name: z.string().min(1),
  type: z.enum(convertEnumToList(E_FormInputType)),

  options: z.array(z.string()).optional().default([]),
  isMultiple: z.boolean().optional().default(false),
  isOptional: z.boolean().optional().default(false),
  isUnique: z.boolean().optional().default(false)   ,
}).superRefine((field, ctx) => {
  const cap = (FieldTypeCapabilities as any)[field.type];

  if (field.isUnique && !cap.canBeUnique) {
    ctx.addIssue({
      code: "custom",
      message: `${field.type} cannot be unique`,
      path: ["isUnique"],
    });
  }
});



export const createActionZod = z.object({
  name: z.string().min(1),
  description: z.string().optional(),

//   actionType: z.enum(["password", "formdata", "geo", "request"]),
    actionType: z.enum(convertEnumToList(E_ActionTypes)),

  config: z.discriminatedUnion("type", [
    z.object({
      type: z.literal(E_ActionTypes.password),
      password: z.string().min(1),
    }),

    z.object({
      type: z.literal(E_ActionTypes.formdata),
      fields: z.array(formFieldZod).min(1),
    }),

    z.object({
      type: z.literal(E_ActionTypes.geo),
      radius: z.number().positive(),
    }),

    z.object({
      type: z.literal(E_ActionTypes.request),
      endpoint: z.string().url(),
    }),
  ]),
});


export const ActionsModel = mongoose.model<IActions>(ActionsModelName, ActionsSchema);
export const ResouceActionModel = mongoose.model<IResouceAction>(ResouceActionName, ResouceActionSchema);

















export function validateActionSchema(
  fields: FormField[],
//   response: Record<string, any>
) {
  const shape: Record<string, any> = {};

  for (const field of fields) {
    let schema;

    // 1. Base type mapping
    switch (field.type) {
      case "text":
        schema = z.string();
        break;

      case "email":
        schema = z.string().email();
        break;

      case "number":
        schema = z.number();
        break;

      case "boolean":
        schema = z.boolean();
        break;

      case "phone":
        schema = z.string().min(6); // basic safety
        break;

      case "date":
      case "datetime":
        schema = z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: `${field.name} must be a valid date string`,
        });
        break;

      default:
        schema = z.any();
    }

    // 2. Apply optional rule
    if (field.isOptional) {
      schema = schema.optional();
    } else {
      schema = schema.refine((val) => val !== undefined && val !== null, {
        message: `${field.name} is required`,
      });
    }

    shape[field.name] = schema;
  }

  // 3. Build final schema
  const schema = z.object(shape);

  return schema

//   // 4. Validate response
//   const parsed = schema.parse(response);

//   return {
//     valid: true,
//     data: parsed,
//   };

// return schema.safeParse(response);
}