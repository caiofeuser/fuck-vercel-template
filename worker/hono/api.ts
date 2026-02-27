import { verifyWebhook } from "@clerk/backend/webhooks";
import { users } from "@db/schema";
import { getDb } from "@worker/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const app = new Hono<{ Bindings: Env }>();

app.post("/webhooks/clerk", async (c) => {
	const signingSecret = c.env.CLERK_WEBHOOK_SIGNING_SECRET;
	if (!signingSecret) {
		console.error("Missing CLERK_WEBHOOK_SIGNING_SECRET");
		return c.json({ error: "Webhook not configured" }, 500);
	}

	try {
		const event = await verifyWebhook(c.req.raw, { signingSecret });
		const db = getDb(c.env.DATABASE_URL);

		if (event.type === "user.created" || event.type === "user.updated") {
			const data = event.data as {
				id: string;
				email_addresses?: { email_address: string }[];
				first_name?: string;
				last_name?: string;
			};
			const email = data.email_addresses?.[0]?.email_address ?? null;
			const name =
				[data.first_name, data.last_name].filter(Boolean).join(" ") || null;

			await db
				.insert(users)
				.values({
					id: data.id,
					email,
					name,
					updatedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: users.id,
					set: { email, name, updatedAt: new Date() },
				});
		}

		if (event.type === "user.deleted") {
			const data = event.data as { id?: string };
			if (data.id) {
				await db.delete(users).where(eq(users.id, data.id));
			}
		}

		return c.json({ received: true }, 200);
	} catch (err) {
		console.error("Clerk webhook error:", err);
		return c.json({ error: "Webhook verification failed" }, 400);
	}
});
