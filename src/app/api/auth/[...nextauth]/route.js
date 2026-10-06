import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectToDatabase();
        
        let user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (credentials.mode === "signup") {
          if (user) throw new Error("An account with this email already exists.");

          if (credentials.role === "admin") {
            const SECRET_PIN = process.env.ADMIN_PIN || "1234";
            if (credentials.adminPin !== SECRET_PIN) {
              throw new Error("Invalid Admin Access PIN.");
            }
          }

          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await User.create({
            email: credentials.email.toLowerCase(),
            password: hashedPassword,
            role: credentials.role === "admin" ? "admin" : "user"
          });

          return { id: user._id.toString(), email: user.email, role: user.role };
        }

        // Login Mode
        if (!user) {
          throw new Error("No account found with this email.");
        }

        if (credentials.role === "admin" && user.role !== "admin") {
          throw new Error("Access denied: You are using a Standard User account.");
        }
        
        if (credentials.role === "user" && user.role === "admin") {
          throw new Error("Admins must use the Admin Login portal.");
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) {
          throw new Error("Incorrect password.");
        }

        return { id: user._id.toString(), email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
