import { compare } from "bcryptjs";
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/security";
import type { UserRole } from "@prisma/client";

export function isInternalAdmin(user: { role: UserRole; email?: string | null }) {
  if (user.role !== "INTERNAL_ADMIN") return false;
  const configuredEmail = process.env.ADMIN_EMAIL?.trim();
  return !configuredEmail || user.email?.toLowerCase() === configuredEmail.toLowerCase();
}

export interface EnterpriseSSOProvider {
  id: string;
  name: string;
  authorize(
    assertion: string,
  ): Promise<{ email: string; organizationId: string } | null>;
}
export const enterpriseSSOProviders: EnterpriseSSOProvider[] = [];

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim() ?? "";
        if (
          !email ||
          !credentials?.password ||
          !(await rateLimit(`login:${email}`, 8, 900))
        )
          return null;
        const user = await prisma.user.findUnique({
          where: { email },
          include: { organization: true },
        });
        if (
          !user ||
          user.organization?.status === "SUSPENDED" ||
          !(await compare(credentials.password, user.passwordHash))
        )
          return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      const current = token.sub
        ? await prisma.user.findUnique({
            where: { id: token.sub },
            select: { email: true, role: true, organizationId: true },
          })
        : null;
      session.user.id = current ? (token.sub ?? "") : "";
      if (current) session.user.email = current.email;
      session.user.role = current?.role ?? token.role;
      session.user.organizationId = current?.organizationId ?? null;
      return session;
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}
