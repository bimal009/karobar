import db from "./database/db"
import * as schema from "./database/schemas/index"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

const isProd = process.env.NODE_ENV === "production"

const BASE_URL = process.env.BETTER_AUTH_URL
const SECRET = process.env.BETTER_AUTH_SECRET

if (!BASE_URL) throw new Error("BETTER_AUTH_URL is not set")
if (!SECRET) throw new Error("BETTER_AUTH_SECRET is not set")

const ROOT_DOMAIN = new URL(BASE_URL).hostname
const PROD_TRUSTED_ORIGINS = [
  `https://${ROOT_DOMAIN}`,
  `https://www.${ROOT_DOMAIN}`,
]

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      verification: schema.verification,
      user: schema.user,
    },
  }),

  secret: SECRET,
  baseURL: BASE_URL,
  trustedOrigins: isProd ? PROD_TRUSTED_ORIGINS : ["http://localhost:3000"],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    hideUserNotFound: false,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour

    sendResetPassword: async ({
      user,
    }: {
      user: { name: string; email: string }
      url: string
    }) => {
      console.warn("[reset-password] email delivery is not configured for:", user.email.split("@")[1] ?? "unknown domain")

      // const html = await render(
      //   React.createElement(ResetPasswordEmail, {
      //     userName: user.name,
      //     resetUrl: url,
      //   }),
      // );
      // const { error } = await resend.emails.send({
      //   from: `rackrage <noreply@${ROOT_DOMAIN}>`,
      //   to: user.email,
      //   subject: "Reset your rackrage password",
      //   html,
      // });
      // if (error) {
      //   throw new Error(`[reset-password] Resend error: ${error.message}`);
      // }
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60 * 24,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
    }: {
      user: { name: string; email: string }
      url: string
    }) => {
      console.warn("[verify-email] email delivery is not configured for:", user.email.split("@")[1] ?? "unknown domain")

      // const html = await render(
      //   React.createElement(VerifyEmail, {
      //     userName: user.name,
      //     verifyUrl: url,
      //   }),
      // );
      // const { error } = await resend.emails.send({
      //   from: `rackrage <noreply@${ROOT_DOMAIN}>`,
      //   to: user.email,
      //   subject: "Verify your rackrage email",
      //   html,
      // });
      // if (error) {
      //   throw new Error(`[verify-email] Resend error: ${error.message}`);
      // }
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: true,
      },
      emailVerified: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: true,
      },
      isOnboarded: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        user,
        url,
      }: {
        user: { name: string; email: string }
        url: string
      }) => {
        console.warn("[change-email] email delivery is not configured for:", user.email.split("@")[1] ?? "unknown domain")

        // const html = await render(
        //   React.createElement(VerifyEmail, {
        //     userName: user.name,
        //     verifyUrl: url,
        //   }),
        // );
        // const { error } = await resend.emails.send({
        //   from: `rackrage <noreply@${ROOT_DOMAIN}>`,
        //   to: user.email,
        //   subject: "Confirm your new rackrage email",
        //   html,
        // });
        // if (error)
        //   throw new Error(`[change-email] Resend error: ${error.message}`);
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: isProd,
      domain: isProd ? `.${ROOT_DOMAIN}` : undefined,
    },
    useSecureCookies: isProd,
    disableCSRFCheck: false,
    cookiePrefix: "rackrage",
  },
})

export type Auth = typeof auth
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user