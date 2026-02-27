import {
	doublePrecision,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text("id").primaryKey(), // Clerk user ID
	email: text("email"),
	name: text("name"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
	id: serial("id").primaryKey(),
	ownerId: text("owner_id").references(() => users.id),
	name: text("name"),
	description: text("description"),
	price: doublePrecision("price"),
});
