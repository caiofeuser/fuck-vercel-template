import { products } from "@db/schema";
import { t } from "@worker/trpc/trpc";

export const productsRouter = t.router({
	list: t.procedure.query(async ({ ctx }) => {
		const result = await ctx.db.select().from(products);
		return result;
	}),
});
