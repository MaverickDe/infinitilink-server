import mongoose, { type Document, Schema, type Types } from "mongoose"
import { IUser } from "./user"

export interface IWallet extends Document {
  user: IUser
  solWallet: IsolWallet
  usdWallet: IUsdWallet
  nairaWallet?: string
  seedPhrase: string
}

export interface IsolWallet extends Document {
  id: string
  user: IUser
  address: string
}

export interface IUsdWallet extends Document {
  user: IUser
  id: string
  status: string
  customer_id: string
  source_deposit_instructions: {
    currency: string
    bank_beneficiary_name: string
    bank_name: string
    bank_address: string
    bank_routing_number: string
    bank_account_number: string
    payment_rails: string[]
    payment_rail: string
  }
  destination: {
    currency: string
    payment_rail: string
    address: string
  }
  developer_fee_percent: string
}

const walletSchema = new Schema<IWallet>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true ,unique:true},
    solWallet: { type: mongoose.Schema.Types.ObjectId, ref: "solWallet" },
    usdWallet: { type: mongoose.Schema.Types.ObjectId, ref: "usdWallet" },
    nairaWallet: { type: String },
    seedPhrase: { type: String, required: true },
  },
  { timestamps: true },
)

const solWalletSchema = new Schema<IsolWallet>(
  {
    id: { type: String, required: true,unique:true  },
    address: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,unique:true },
  },
  { timestamps: true },
)

const usdWalletSchema = new Schema<IUsdWallet>(
  {
    id: { type: String, required: true,unique:true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,unique:true },
    status: { type: String, required: true },
    customer_id: { type: String, required: true },
    source_deposit_instructions: {
      currency: { type: String },
      bank_beneficiary_name: { type: String },
      bank_name: { type: String },
      bank_address: { type: String },
      bank_routing_number: { type: String },
      bank_account_number: { type: String },
      payment_rails: [String],
      payment_rail: { type: String },
    },
    destination: {
      currency: { type: String },
      payment_rail: { type: String },
      address: { type: String },
    },
    developer_fee_percent: { type: String },
  },
  { timestamps: true },
)

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema)
export const usdWallet = mongoose.model<IUsdWallet>("usdWallet", usdWalletSchema)
export const solWallet = mongoose.model<IsolWallet>("solWallet", solWalletSchema)

