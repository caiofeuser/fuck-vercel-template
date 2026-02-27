let getToken: (() => Promise<string | null>) | null = null;

export function setClerkGetToken(fn: () => Promise<string | null>) {
	getToken = fn;
}

export async function getClerkToken(): Promise<string | null> {
	return getToken ? getToken() : null;
}
