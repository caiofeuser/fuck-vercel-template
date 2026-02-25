import { initTRPC } from "@trpc/server";
// import type { AppRouter } from "@worker/trpc/router"; was I using this?
import type { Context } from "./context";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
