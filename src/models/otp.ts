import mongoose, { type Document, Schema } from "mongoose"

export interface IOtp extends Document {
  otp: string
  email: string
  type: string
  genratedCount: number
  expiresAt: Date
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true,unique:true },
    type: { type: String, required: true },
    genratedCount: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

// Set default expiration time if not provided
OtpSchema.pre<IOtp>("save", function (next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  }
  next()
})

export const Otp = mongoose.model<IOtp>("Otp", OtpSchema)

