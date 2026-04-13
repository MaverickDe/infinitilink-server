import mongoose, { Schema, Document } from "mongoose";

interface ISourceDepositInstructions {
  payment_rail: string;
  amount: string;
  currency: string;
  deposit_message: string;
  bank_name: string;
  bank_address: string;
  bank_routing_number: string;
  bank_account_number: string;
  bank_beneficiary_name: string;
}

// interface SourceDepositInstructions {
//   payment_rail: string;
//   amount: string;
//   currency: string;
//   deposit_message: string;
//   bank_name: string;
//   bank_address: string;
//   bank_routing_number: string;
//   bank_account_number: string;
//   bank_beneficiary_name: string;
// }


interface ISource {
  payment_rail: string;
  currency: string;
  external_account_id: string | null;
}

interface IDestination {
  payment_rail: string;
  currency: string;
  to_address: string;
}

interface IReceipt {
  initial_amount: string;
  developer_fee: string;
  exchange_fee: string;
  final_amount: string;
}

export interface ITransfer extends Document {
  id: string;
  nickname?: string;
  state: string;
  on_behalf_of: string;
  amount: string;
  developer_fee: string;
  source_deposit_instructions: ISourceDepositInstructions;
  source: ISource;
  destination: IDestination;
  receipt: IReceipt;
  created_at: Date;
  updated_at: Date;
}

const TransferSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    nickname: { type: String,},
    state: { type: String, required: true },
    client_reference_id: { type: String },
    on_behalf_of: { type: String, required: true },
    amount: { type: String, required: true },
    developer_fee: { type: String, },
    source_deposit_instructions: {
      payment_rail: { type: String, required: true },
      amount: { type: String, required: true },
      currency: { type: String, required: true },
      deposit_message: { type: String, },
      bank_name: { type: String, },
      bank_address: { type: String,  },
      bank_routing_number: { type: String, },
      bank_account_number: { type: String,  },
      bank_beneficiary_name: { type: String, },
    },
    source: {
      payment_rail: { type: String, required: true },
      currency: { type: String, required: true },
      external_account_id: { type: String, default: null },
    },
    destination: {
      payment_rail: { type: String, required: true },
      currency: { type: String, required: true },
      to_address: { type: String,  },
    
    },
    receipt: {
      initial_amount: { type: String, },
      developer_fee: { type: String,  },
      exchange_fee: { type: String,  },
      subtotal_amount: { type: String,  },
      final_amount: { type: String, },
    },
    // created_at: { type: Date, required: true, default: Date.now },
    // updated_at: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const Transactions = mongoose.model<ITransfer>("Transfer", TransferSchema);
