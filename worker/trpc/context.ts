import { verifyToken } from "@clerk/backend";
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
	let user = null;
	const authHeader = req.headers.get("Authorization");
	const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

	if (token && env.CLERK_SECRET_KEY!) {
		token;
		try {
			const { sub } = await verifyToken(token, {
				secretKey: env.CLERK_SECRET_KEY,
			});

			console.log("Clerk user id (sub):", sub);
			user = sub;
		} catch (error) {
			console.error("Error verifying token:", error);
		}
	}

	return {
		req,
		env,
		workerCtx,
		db: getDb(env.DATABASE_URL),
		user,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
