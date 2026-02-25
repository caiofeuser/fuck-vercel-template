import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { app } from "@worker/hono/api";
import { createContext } from "@worker/trpc/context";
import { appRouter } from "@worker/trpc/router";
import {
	type ExtractionJobPayload,
	processExtractionJob,
} from "./queues/extraction";

export default {
	fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname.startsWith("/trpc")) {
			return fetchRequestHandler({
				endpoint: "/trpc",
				req: request,
				router: appRouter,
				createContext: () =>
					createContext({ req: request, env: env, workerCtx: ctx }),
			});
		}
		return app.fetch(request, env, ctx);
	},
	async queue(batch, env, _ctx) {
		for (const message of batch.messages) {
			try {
				const payload = message.body as ExtractionJobPayload;
				await processExtractionJob(payload, env);
				message.ack();
			} catch (error) {
				console.error("Extraction job failed:", error);
				message.retry();
			}
		}
	},
} satisfies ExportedHandler<Env>;
