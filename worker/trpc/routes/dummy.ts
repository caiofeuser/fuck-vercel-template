import { t } from "@worker/trpc/trpc";
import { z } from "zod";

export const DummyRouter = t.router({
	getData: t.procedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return {
				id: input.id,
				name: "Dummy Data",
			};
		}),
});
