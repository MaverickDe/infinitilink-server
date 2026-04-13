import mongoose, { type Document, Schema, Types } from "mongoose"
import { IUser } from "./user";
import { BankBioDataModelName, IBankBioData } from "./bankBioData";
import { BankModelName, IBank } from "./banks";
export const  CategoriesModelName ="Categories";
export interface ICategories extends Document {

  name: String;
  description: String;

}

export let CategoriesGenericObj =  {
    name: { 
      type: String, 
      required: true, 
     
      sparse: true // Important: Use sparse if alias is optional but unique
    },   
    description: { 
      type: String, 
      required: false, 
 
    },   
    

  }

const CategoriesSchema = new Schema<ICategories>(
CategoriesGenericObj ,
  { timestamps: true }
);
// Exporting the model
export const CategoriesModel = mongoose.model<ICategories>(CategoriesModelName, CategoriesSchema);
// CategoriesModel.createIndexes({ user: 1 });








