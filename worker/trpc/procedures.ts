import { TRPCError } from "@trpc/server";
import { t } from "@worker/trpc";

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({ ctx: { ...ctx, user: ctx.user } });
});

export const publicProcedure = t.procedure;
