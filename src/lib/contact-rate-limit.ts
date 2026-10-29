import { createHash } from 'node:crypto'
import { isIP } from 'node:net'

const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 30
const MAX_CLIENTS = 5000
const attempts = new Map<string, { count: number; resetAt: number }>()

/** Best-effort per-instance defence; distributed enforcement belongs at the WAF. */
export function contactRetryAfter(headers: Headers, now = Date.now()): number {
	// Only trust the IP header when deployed behind Vercel's own proxy.
	if (process.env.VERCEL !== '1') return 0
	const ip = headers.get('x-vercel-forwarded-for')?.trim()
	if (!ip || !isIP(ip)) return 0
	const key = createHash('sha256').update(ip).digest('hex')
	let entry = attempts.get(key)
	if (!entry || entry.resetAt <= now) {
		for (const [client, value] of attempts) {
			if (value.resetAt <= now) attempts.delete(client)
		}
		// Bound memory without rejecting unrelated legitimate customers.
		if (attempts.size >= MAX_CLIENTS && !attempts.has(key)) return 0
		entry = { count: 0, resetAt: now + WINDOW_MS }
		attempts.set(key, entry)
	}
	entry.count += 1
	return entry.count > MAX_ATTEMPTS
		? Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
		: 0
}
