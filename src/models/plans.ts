import mongoose, { Schema, Document } from "mongoose";

export interface IPlans extends Document {
  name: string;
  nickName: string;
  amount:number;
  interval:string;
  title:string;
  currency:string;
  plan_code:string
   send_invoices: boolean,
    send_sms: boolean,
}

const PlansSchema: Schema = new Schema({
  name: { type: String, required: true },
  nickName: { type: String, required: true,unique:true },
  amount: { type: Number, required: true  },
  interval: { type: String, required: true  },
  currency: { type: String, required: true  },
  plan_code: { type: String, required: true  },
  title: { type: String, required: true  },
  send_invoices: { type: Boolean,   },
  send_sms: { type: Boolean,   },
});

export const Plans = mongoose.model<IPlans>("Plans", PlansSchema);




const SubscriptionSchema = new mongoose.Schema({
  subscriptionCode: { type: String, required: true, unique: true },
  email: { type: String, required: true },            // customer email
  customerCode: { type: String },                     // Paystack customer_code
  planCode: { type: String, required: true },         // plan_code from Paystack
  status: { type: String, enum: ["active", "non-renewing", "disabled", "ended"], default: "active" },
  startDate: { type: Date },                          // when sub started
  nextPayment: { type: Date },                        // Paystack sends next_payment_date
  amount: { type: Number },                           // in normal units
  currency: { type: String, default: "NGN" },         // or "USD"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Subscriptions = mongoose.model("Subscription", SubscriptionSchema);




const InvoiceSchema = new mongoose.Schema({
  invoiceId: { type: Number, required: true, unique: true }, // Paystack invoice id
  subscriptionCode: { type: String, required: true },        // link back to subscription
  customerEmail: { type: String, required: true },
  amount: { type: Number, required: true },                  // in normal units
  currency: { type: String, default: "NGN" },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  dueDate: { type: Date },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const Invoices =  mongoose.model("Invoice", InvoiceSchema);




const PaymentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true }, // Paystack reference
  customerEmail: { type: String, required: true },
  amount: { type: Number, required: true },                  // in normal units
  currency: { type: String, default: "NGN" },
  status: { type: String, enum: ["success", "failed"], default: "success" },
  paidAt: { type: Date },
  channel: { type: String },                                 // e.g. card, bank
  plan: { type: String },                                 // e.g. card, bank
  gatewayResponse: { type: String },                         // response message
  createdAt: { type: Date, default: Date.now },
});

export const Payments = mongoose.model("Payment", PaymentSchema);
