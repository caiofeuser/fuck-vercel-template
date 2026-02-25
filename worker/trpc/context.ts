import { getDb } from "@worker/db";

export async function createContext({
	req,
	env,
	workerCtx,
}: {
	req: Request;
	env: Env;
	workerCtx: ExecutionContext;
}) {
	return {
		req,
		env,
		workerCtx,
		db: getDb(env.DATABASE_URL),
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
