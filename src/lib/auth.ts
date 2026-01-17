import type { NextAuthOptions } from "next-auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { generateFromEmail } from "unique-username-generator";
import { authRateLimit } from "@/lib/limiter";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        password: { label: "Password", type: "password" },
        type: { label: "Type", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Invalid email or password.");
        }

        const { email, password, otp, type } = credentials;
        const normalizedEmail = email.trim().toLowerCase();

        const { success } = await authRateLimit.limit(normalizedEmail);
        if (!success) {
          throw new Error("Too many login attempts. Try again later.");
        }

        await connectDB();

        const user = await User.findOne({
          email: normalizedEmail,
          role: "expert",
        }).select("+password +otp +otpExpiry +tokenVersion");

        if (!user || user.isBanned) {
          throw new Error("Invalid email or password.");
        }

        /* ---------- OTP LOGIN ---------- */
        if (type === "otp") {
          if (!otp || !user.otp || !user.otpExpiry) {
            throw new Error("Invalid verification code.");
          }

          const validOtp = await bcrypt.compare(otp, user.otp);
          if (!validOtp) throw new Error("Invalid verification code.");

          if (user.otpExpiry < new Date()) {
            throw new Error("Verification code expired.");
          }

          user.isVerified = true;
          user.otp = undefined;
          user.otpExpiry = undefined;
          user.tokenVersion = user.tokenVersion ?? 0;

          await user.save();
          return user;
        }

        /* ---------- PASSWORD LOGIN ---------- */
        if (type === "password") {
          if (!password || !user.password) {
            throw new Error("Invalid email or password.");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email first.");
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) throw new Error("Invalid email or password.");

          return user;
        }

        throw new Error("Invalid authentication method.");
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      await connectDB();
      const normalizedEmail = user.email!.toLowerCase();

      let existingUser = await User.findOne({
        email: normalizedEmail,
        role: "expert",
      });

      if (existingUser) {
        if (existingUser.isBanned) return false;

        existingUser.googleId ||= profile?.sub;
        existingUser.isVerified = true;
        existingUser.tokenVersion ||= 0;

        await existingUser.save();
        return true;
      }

      const username = generateFromEmail(normalizedEmail, 3);

      await User.create({
        name: user.name,
        email: normalizedEmail,
        image: user.image,
        username,
        role: "expert",
        provider: "google",
        googleId: profile?.sub,
        isVerified: true,
        tokenVersion: 0,
      });

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tokenVersion = user.tokenVersion;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tokenVersion = token.tokenVersion;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};
