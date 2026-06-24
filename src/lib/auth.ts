import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DEMO_USER } from "./constants";
import { loginSchema } from "./validation";

/**
 * next-auth (v5 / Auth.js) configuration.
 *
 * Dummy authentication: the Credentials provider validates the submitted
 * email/password against a single hardcoded demo user. On success next-auth
 * issues a signed JWT stored in an httpOnly cookie — i.e. the token is held
 * in the session, never exposed to client JS or localStorage.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  // Self-hosted prod (`next start`) doesn't auto-trust the request host the way
  // dev/Vercel do; without this every /api/auth/* call 500s with UntrustedHost.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        if (email === DEMO_USER.email && password === DEMO_USER.password) {
          return { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email };
        }
        return null;
      },
    }),
  ],
});
