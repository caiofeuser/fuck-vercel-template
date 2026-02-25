import { DummyRouter } from "@worker/trpc/routes/dummy";
import { extractionRouter } from "@worker/trpc/routes/extraction/router";
import { productsRouter } from "@worker/trpc/routes/products/router";
import { t } from "@worker/trpc/trpc";

export const appRouter = t.router({
	getDummyRouter: DummyRouter,
	products: productsRouter,
	extraction: extractionRouter,
});

export type AppRouter = typeof appRouter;
