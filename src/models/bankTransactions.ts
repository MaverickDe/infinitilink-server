import mongoose, { type Document, Schema, Types } from "mongoose";
import { BankAdminModelName, IBankAdmin } from "./bankModels/bankAdmin";
import { BankModelName, IBank } from "./banks";
import { Connection } from "mongoose";
import { IUser } from "./user";
// import { BankModelName, IBank } from "../banks";
export const UserBankTransactionsModelName = "UserBankTransactions";

export enum EBankInstitutionCategory {
  FINTECH="FINTECH",
  DIGITAL_BANK="DIGITAL_BANK",
  PAYMENT_PROVIDER="PAYMENT_PROVIDER",
  WALLET_PROVIDER="WALLET_PROVIDER",
  SME="SME",
  MARKETPLACE="MARKETPLACE",
  ECOMMERCE="ECOMMERCE",
  REMITTANCE="REMITTANCE",
  CRYPTO="CRYPTO",
  INVESTMENT="INVESTMENT",
  LENDING="LENDING",
  SAVINGS="SAVINGS",
  INSURANCE="INSURANCE",
  BILL_PAYMENT="BILL_PAYMENT",
  GAMING="GAMING",
  BETTING="BETTING",
  EDUCATION="EDUCATION",
  LOGISTICS="LOGISTICS",
  TELECOM="TELECOM",
  UTILITIES="UTILITIES",
  NGO="NGO",
  GOVERNMENT="GOVERNMENT",
  ENTERPRISE="ENTERPRISE",
  OTHER="OTHER"
}
export interface IUserBankTransactions extends Document {
//   firstName: string;
  accountName: string;
  accountNumber: string;
  associateBank:Types.ObjectId | IBank;
  nipsession: string;
  amount: number;

  isSender:boolean;
  isReconciled:boolean;
   SGid:string;
     walletSettled: boolean,
//   shortAbriv: string;
//   name: string;

  bank: Types.ObjectId | IBank;
  user: Types.ObjectId | IUser;
}

const UserBankTransactionsSchema = new Schema<IUserBankTransactions>(
  {
    // accessCode: { type: String,required: false,unique:false },
accountName: {
  type: String,
  required: true,

  trim: true,
},
SGid: {
  type: String,
  

},
amount: {
  type: Number,
  

},
nipsession: {
  type: String,
  required: true,
//   unique:true,

},
isReconciled: {
  type: Boolean,
  default: false,

},

walletSettled: {
  type: Boolean,
  default: false,

},
isSender: {
  type: Boolean,
  default: false,

},
              
 
 
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: BankModelName,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    associateBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: BankModelName,
      required: true,
    },
    // privyId: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const UserBankTransactions = mongoose.model<IUserBankTransactions>(
  UserBankTransactionsModelName,
  UserBankTransactionsSchema,
);

export const getUserBankTransactionsModel = (conn: Connection|"main") => {

  // let conn: Connection = context.db
  return conn=="main"?UserBankTransactions:(conn.models[UserBankTransactionsModelName] || conn.model<IUserBankTransactions>(UserBankTransactionsModelName, UserBankTransactionsSchema)) 
  ;
};