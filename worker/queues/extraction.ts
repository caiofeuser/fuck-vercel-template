import { getDb } from "@worker/db";

export type ExtractionJobPayload = {
	text: string;
	jobId: string;
};

export async function processExtractionJob(
	payload: ExtractionJobPayload,
	env: Env,
): Promise<void> {
	const { text, jobId } = payload;

	// TODO: Add your AI extraction logic here
	// Example: call OpenAI, Anthropic, or Cloudflare Workers AI
	// const extracted = await extractWithAI(text);

	console.log(
		`Processing extraction job ${jobId} for text:`,
		text.slice(0, 50),
	);

	// Placeholder: db available for when you add extraction + insert
	const _db = getDb(env.DATABASE_URL);
	void _db;
}
