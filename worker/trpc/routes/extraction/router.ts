import { t } from "@worker/trpc";
import { protectedProcedure } from "@worker/trpc/procedures";
import { z } from "zod";

export const extractionRouter = t.router({
	enqueue: protectedProcedure
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
