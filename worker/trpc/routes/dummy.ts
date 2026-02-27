import { t } from "@worker/trpc";
import { z } from "zod";
import { publicProcedure } from "../procedures";

export const DummyRouter = t.router({
	getData: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return {
				id: input.id,
				name: "Dummy Data",
			};
		}),
});
