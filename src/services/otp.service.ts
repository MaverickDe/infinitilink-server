import type { OTPTYPE } from "../constant"
import { Otp } from "../models/otp"

export class OtpService {
  static async generateOtp(data: { email: string; type: OTPTYPE }) {
    const { email, type } = data

    try {
      // Generate a 6-digit OTP (changed from 4-digit)
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
console.log(otp,"opop")
      // Set expiration time (10 minutes from now)
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)
      const now = new Date()

      // Check if an OTP already exists for this email and type
      const existingOtp = await Otp.findOne({ email, type ,   expiresAt: { $lt: now }, })
      console.log(existingOtp,"opopccc")
      if (existingOtp) {
        // Update existing OTP
        existingOtp.otp = otp
        existingOtp.expiresAt = expiresAt
        existingOtp.genratedCount = (existingOtp.genratedCount || 0) + 1
        await existingOtp.save()
        return otp
      } else {
        // Create new OTP
        await Otp.create({
          email,
          type,
          otp,
          expiresAt,
          genratedCount: 1,
        })
        return otp
      }
    } catch (error) {
      console.error("Error generating OTP:", error)
      throw new Error("Failed to generate OTP")
    }
  }

  static async verifyOtp(data: { otp: number; email: string; type: OTPTYPE }): Promise<boolean> {
    const { otp, email, type } = data

    try {
      const now = new Date()

      // Find a valid OTP that matches the criteria and hasn't expired
      const otpRecord = await Otp.findOne({
        email,
        otp: otp.toString(),
        type,
        expiresAt: { $gt: now },
      })

      if (!otpRecord) {
        return false
      }

      // Delete the OTP after successful verification to prevent reuse
      await Otp.deleteOne({ _id: otpRecord._id })

      return true
    } catch (error) {
      console.error("Error verifying OTP:", error)
      throw new Error("Failed to verify OTP")
    }
  }
}

