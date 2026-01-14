// src/services/authService.ts
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import ExpertProfile from "@/models/ExpertProfile";
import { sendOtpEmail } from "@/lib/email";
import { otpRateLimit } from "@/lib/limiter";
import { generateSecureOtp } from "@/lib/utils";
import { generateFromEmail } from "unique-username-generator";
// import { RegisterInput } from "@/schemas/authSchemas";
import { RegisterInput } from "@/server/auth/auth.schemas";

async function fakeWork() {
  await bcrypt.hash("dummy_password_!@#$", 10);
  await new Promise((res) => setTimeout(res, 10 + Math.random() * 30));
}

export async function registerUserService(values: RegisterInput) {
  try {
    const { name, email, password } = values;
    const normalizedEmail = email.trim().toLowerCase();

    // Rate limiting
    const { success } = await otpRateLimit.limit(normalizedEmail);
    if (!success) return { error: "Too many attempts. Wait 10 minutes." };

    await connectDB();

    // Check existing user
    const existingUser = await User.findOne({ email: normalizedEmail, role: "expert" });

    let userRecord = existingUser;
    let mustSendEmailAfterCommit = false;

    // CASE A — User exists & verified
    if (existingUser && existingUser.isVerified) {
      await fakeWork();
      return {
        success: "If an account exists, a verification code has been sent.",
        email: normalizedEmail,
      };
    }

    // OTP + password prep
    const otp = generateSecureOtp(6);
    console.log(otp);
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    // CASE B — User exists but not verified
    if (existingUser && !existingUser.isVerified) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: existingUser._id, isVerified: false },
        { $set: { name, password: hashedPassword, otp: otpHash, otpExpiry } },
        { new: true }
      );

      if (updatedUser) {
        userRecord = updatedUser;
        mustSendEmailAfterCommit = true;
      }
    }

    // CASE C — New user
    if (!existingUser) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const username = generateFromEmail(normalizedEmail, 3);

        const newUser = await User.create(
          [
            {
              name,
              email: normalizedEmail,
              password: hashedPassword,
              image: `https://ui-avatars.com/api/?name=${name}&background=random`,
              username,
              otp: otpHash,
              otpExpiry,
              isVerified: false,
              role: "expert",
            },
          ],
          { session }
        );

        userRecord = newUser[0];

        await ExpertProfile.create([{ user: userRecord._id }], { session });

        await session.commitTransaction();
        session.endSession();

        mustSendEmailAfterCommit = true;
      } catch (err) {
        console.error("Transaction Error:", err);
        await session.abortTransaction();
        session.endSession();
        return { error: "Registration failed. Please try again." };
      }
    }

    // Send OTP after commit
    if (mustSendEmailAfterCommit) {
      try {
        await sendOtpEmail(normalizedEmail, otp);
      } catch (emailError) {
        console.error("Email failed after commit:", emailError);
        return {
          success: "Account created, but email failed. Please use Resend OTP.",
          email: normalizedEmail,
        };
      }
    }

    return {
      success: "If an account exists, a verification code has been sent.",
      email: normalizedEmail,
    };
  } catch (err) {
    console.error("Registration Error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
