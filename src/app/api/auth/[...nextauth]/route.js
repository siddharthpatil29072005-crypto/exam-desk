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
        
        let user = await User.findOne({ email: credentials.email });

        // Auto-create the admin user if it doesn't exist
        if (!user && credentials.email === "siddharthpatil29072005@gmail.com" && credentials.password === "Pass@123") {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await User.create({
            email: credentials.email,
            password: hashedPassword,
            role: "admin"
          });
        } else if (!user) {
          // Auto-signup logic for other users to keep it simple like before
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await User.create({
            email: credentials.email,
            password: hashedPassword,
            role: "user"
          });
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) {
          throw new Error("Invalid password");
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
