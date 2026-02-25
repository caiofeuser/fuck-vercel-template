import { t } from "@worker/trpc/trpc";
import { z } from "zod";

export const extractionRouter = t.router({
	enqueue: t.procedure
		.input(
			z.object({
				text: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const jobId = crypto.randomUUID();

			await ctx.env.AI_EXTRACTION_QUEUE.send(
				{
					text: input.text,
					jobId,
				},
				{ contentType: "json" },
			);

			return {
				jobId,
				status: "queued" as const,
			};
		}),
});
