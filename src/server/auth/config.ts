import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "~/server/db";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      ...(process.env.NODE_ENV === "production"
        ? {
            // In production (Vercel / Resend)
            server: process.env.EMAIL_SERVER,
          }
        : {
            // In local dev: use Nodemailer jsonTransport and log the link
            server: { jsonTransport: true },
            async sendVerificationRequest({ url }) {
              console.log("🪄 LOGIN LINK:", url);
            },
          }),
    }),
    ...(process.env.NODE_ENV != "production"
      ? [Credentials({
        name: "Dev Login",
        credentials: { email: { label: "Email", type: "email" } },
        async authorize({ email }) {
          const safeEmail = typeof email === "string" && email.length > 0 ? email.toLowerCase() : "dev@example.com";
          const user = await prisma.user.upsert({
            where: { email: safeEmail },
            update: {},
            create: { email: safeEmail, name: "Dev User" },
          });
          return { id: user.id, email: user.email ?? safeEmail, name: user.name ?? "Dev User" }
        },
      })] : []),
  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

