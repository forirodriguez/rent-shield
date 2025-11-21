import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        console.log('🔐 [AUTH] Starting authorization...');
        console.log('🔐 [AUTH] Credentials received:', { email: credentials?.email, hasPassword: !!credentials?.password });
        
        const validated = loginSchema.safeParse(credentials);

        if (!validated.success) {
          console.log('❌ [AUTH] Validation failed:', validated.error.issues);
          return null;
        }

        const { email, password } = validated.data;
        console.log('🔐 [AUTH] Looking up user:', email);

        try {
          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log('❌ [AUTH] User not found:', email);
            return null;
          }

          console.log('✅ [AUTH] User found:', { id: user.id, email: user.email, hasPassword: !!user.password });

          if (!user.password) {
            console.log('❌ [AUTH] User has no password (OAuth user)');
            return null;
          }

          console.log('🔐 [AUTH] Comparing passwords...');
          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            console.log('❌ [AUTH] Password mismatch');
            return null;
          }

          console.log('✅ [AUTH] Password match! Login successful');

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error('❌ [AUTH] Error during authorization:', error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
