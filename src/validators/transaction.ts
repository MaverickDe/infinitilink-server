import { z } from "zod";

export const singleTransactionSchema = z.object({
  accountName: z.string().trim().min(1),
  accountNumber: z.string().trim().min(5),

  SGid: z.string().optional(),

  nipsession: z.string().min(1),

  isSender: z.boolean().optional(),

  amount: z.number().positive(),

  currency: z.string().default("NGN").optional(),

  narration: z.string().max(255).optional(),
  reference: z.string().max(255).optional(),

  associateBank: z.string().optional(),

  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "invalid timestamp",
  }),
});

// export const ingestTransactionsValidator = z.object({
//   transactionData: z
//     .array(
//       z.object({
//         userId: z.string().min(1),
//         accountBalance: z.number().positive().optional(),
//         consentId: z.string().min(1),
//         transaction: singleTransactionSchema,
//       })
//     )
//     .min(1)
//     .max(20),
// });







// ---------------- GROUPED USER TRANSACTIONS ----------------
export const userTransactionBatchSchema = z.object({
  userId: z.string().min(1),

  consentId: z.string().min(1).optional(),

  accountBalance: z.number().nonnegative().optional(),

  // optional batch timestamp (used for balance ordering)
  timestamp: z.string().datetime().optional(),

  transactions: z
    .array(singleTransactionSchema)
    .min(1)
    .max(5), // you can tune this
});

// ---------------- ROOT VALIDATOR ----------------
export const ingestTransactionsValidator = z.object({
  transactionData: z
    .array(userTransactionBatchSchema)
    .min(1)
    .max(20), // your batch limit
});


export type T_transactionData = z.infer<typeof userTransactionBatchSchema>;