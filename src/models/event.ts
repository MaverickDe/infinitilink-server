import { Schema, model, Document } from "mongoose";

interface IEventObject {
  id: string;
  type: string;
  amount: string;
  source: {
    description: string;
    sender_name: string;
    payment_rail: string;
    sender_bank_routing_number: string;
  };
  gas_fee: string;
  currency: string;
  created_at: Date;
  deposit_id: string;
  customer_id: string;
  subtotal_amount: string;
  virtual_account_id: string;
  destination_tx_hash: string | null;
  exchange_fee_amount: string;
  developer_fee_amount: string;
}
type EventObjectChanges = {
  [key: string]: [string | null, string]; // Dynamic keys with values as two-element arrays
};

interface IEvent extends Document {
  api_version: string;
  event_id: string;
  event_category: string;
  event_type: string;
  eventdata: string;
  event_object_status: string | null;
  event_object: IEventObject;
  event_object_changes: EventObjectChanges;
  event_created_at: Date;
}

const EventObjectSchema = new Schema<IEventObject>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: String, required: true },
  source: {
    description: { type: String, required: true },
    sender_name: { type: String, required: true },
    payment_rail: { type: String, required: true },
    sender_bank_routing_number: { type: String, required: true },
  },
  gas_fee: { type: String, required: true },
  currency: { type: String, required: true },
  created_at: { type: Date, required: true },
  deposit_id: { type: String, required: true },
  customer_id: { type: String, required: true },
  subtotal_amount: { type: String, required: true },
  virtual_account_id: { type: String, required: true },
  destination_tx_hash: { type: String, default: null },
  exchange_fee_amount: { type: String, required: true },
  developer_fee_amount: { type: String, required: true },
});

const EventSchema = new Schema<IEvent>({
  api_version: { type: String, required: true },
  event_id: { type: String, required: true },
  event_category: { type: String, required: true },
  event_type: { type: String, required: true },
  eventdata: { type: String, required: true },
  event_object_status: { type: String, default: null },
  event_object: { type: EventObjectSchema, required: true },
  // event_object_changes: {
  //   destination_tx_hash: { type: [String], required: true },
  // },
  event_object_changes: {
    type: Map,
    of: [String], // Dynamic keys, each storing an array of strings
    default: {},  // Default to an empty object if not provided
  },
  event_created_at: { type: Date, required: true },
});

export const Events = model<IEvent>("Event", EventSchema);

// export  Events;
