import { products } from "@db/schema";
import { t } from "@worker/trpc";
import { protectedProcedure } from "@worker/trpc/procedures";
import { eq } from "drizzle-orm";

export const productsRouter = t.router({
	list: protectedProcedure.query(async ({ ctx }) => {
		console.log("ctx.user:", ctx.user);
		const result = await ctx.db
			.select()
			.from(products)
			.where(eq(products.ownerId, ctx.user));
		return result;
	}),
});
