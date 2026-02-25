import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

let cached: ReturnType<typeof drizzle> | null = null;

export function getDb(dbUrl: string) {
	if (!cached) {
		const sql = neon(dbUrl);
		cached = drizzle(sql, { schema });
	}
	return cached;
}
