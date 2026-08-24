import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { enforceRateLimit, type RateLimitPolicy } from "../rateLimit";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

function getRateLimitIdentifier(ctx: TrpcContext) {
  if (ctx.user) return `user:${ctx.user.id}`;
  return `ip:${ctx.req.ip || ctx.req.socket?.remoteAddress || "anonymous"}`;
}

function withRateLimit(scope: string, policy: RateLimitPolicy) {
  return t.middleware(async ({ ctx, next }) => {
    const result = await enforceRateLimit(scope, getRateLimitIdentifier(ctx), policy);
    if (!result.allowed) {
      const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
      ctx.res.setHeader?.("Retry-After", String(retryAfter));
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit reached. Please try again in about ${retryAfter} seconds.`,
      });
    }
    return next();
  });
}

export function rateLimitedPublicProcedure(scope: string, policy: RateLimitPolicy) {
  return publicProcedure.use(withRateLimit(scope, policy));
}

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export function rateLimitedProtectedProcedure(scope: string, policy: RateLimitPolicy) {
  return protectedProcedure.use(withRateLimit(scope, policy));
}

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

export function rateLimitedAdminProcedure(scope: string, policy: RateLimitPolicy) {
  return adminProcedure.use(withRateLimit(scope, policy));
}
