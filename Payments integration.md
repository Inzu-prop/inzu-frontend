## Payment confirmation brief for frontend

Summary
- Goal: reliably show payment confirmation to users after they initiate a payment.
- Two recommended approaches (primary + fallback):
	1. Server push (preferred): receive confirmation via WebSocket or server-sent events (SSE) or use an app-level websocket channel (chat-like).
	2. Polling (simple fallback): poll a dedicated payment status endpoint until confirmed or timed out.
- Additionally: accept (and display) server-initiated webhook events that the backend receives from payment providers; these update the server-side payment status.

Assumptions (adjust if backend differs)
- The backend exposes a payment request endpoint that returns a payment id (`paymentId`) and a payment provider redirect URL or checkout URL.
- The backend exposes a payment status endpoint: `GET /api/payments/:paymentId` returning current status and metadata.
- Backend receives webhook callbacks from payment processors and updates payment records atomically.
- Authentication (Bearer token or cookie) is required for APIs.
- If WebSockets are available, the server can push status updates over a user-specific channel.

High-level data contract (suggested)
- Payment creation response (POST /api/payments)
	- 201 Created
	- body:

```json
{
	"paymentId": "pay_abc123",
	"checkoutUrl": "https://pay.provider/checkout/xxx",
	"status": "pending",
	"amount": 12345,
	"currency": "KES",
	"createdAt": "2026-03-14T12:34:56Z"
}
```
- Payment status response (GET /api/payments/:paymentId)
	- 200 OK
	- body:

```json
{
	"paymentId": "pay_abc123",
	"status": "pending" | "confirmed" | "failed" | "expired",
	"providerReference": "mpesa_789",
	"confirmedAt": "2026-03-14T12:37:01Z" | null,
	"failureReason": "insufficient_funds" | null
}
```

Recommended statuses and transitions
- `pending` -> `confirmed`
- `pending` -> `failed`
- `pending` -> `expired` (timeout)
- `confirmed` and `failed` are terminal states

Frontend flows

1) Preferred: WebSocket / SSE push
- After creating payment, frontend opens or has an existing authenticated WebSocket connection to receive payment updates.
- Subscribe to a user-scoped or payment-scoped channel (e.g., `payments:user:{userId}` or `payment:{paymentId}`).
- When server pushes `{ "paymentId": "pay_abc", "status": "confirmed", "confirmedAt": "..." }` update UI immediately.
- Benefits: instant updates, no unnecessary polling, robust UX on slow redirects.

2) Polling (fallback)
- After receiving `paymentId` from create response, poll `GET /api/payments/:paymentId`.
- Polling strategy:
	- Interval: start at 2s for first 20s, then back off: 2s x 10 tries => 20s; increase to 5s next 6 tries => +30s; then 15s for up to 5 tries => +75s. Total ≈ 125s. Or use exponential backoff capped at e.g., 15s.
	- Stop polling when status becomes `confirmed`/`failed`/`expired`.
	- Max total duration: ~2 minutes (configurable).
	- If frontend is backgrounded, stop polling and resume when user returns or rely on push.
- Request headers: include auth token.
- Example polling lifecycle:
	- t=0: GET `/api/payments/pay_abc` -> pending
	- t=2s: GET -> pending
	- ...
	- t=14s: GET -> confirmed -> stop and show success

3) Redirect/return from provider
- If payment flow uses a redirect (checkoutUrl), the provider often redirects back to the frontend with query params or to a backend callback. Do NOT rely solely on redirect for final confirmation; always verify via `GET /api/payments/:paymentId` or server push because provider redirect can be tampered with.

Idempotency and duplicate handling
- When sending any confirmation action from frontend (rare), ensure use of idempotency keys.
- On poll responses, use the returned status to dedupe UI updates (only transition forward).
- If user retries payment creation, backend should create a separate `paymentId` but link to same business operation if needed.

Security
- Authenticate all payment status and creation requests (Bearer token or session cookie).
- Never expose raw provider secrets to the client.
- Validate redirect query params on server; let server verify provider signature before updating status.

Error handling on frontend
- Network errors: retry with backoff; display "Checking payment status..." and a spinner.
- 401/403: prompt re-login or reauthenticate, then retry.
- 500: show transient error and retry later; log for support.
- If status remains pending after max duration: show "Still processing" with option to re-check manually or contact support.

UX suggestions
- When user is waiting for payment confirmation: show a clear in-progress state with:
	- message like "We’re processing your payment. This may take up to 2 minutes."
	- show a spinner and a "Check status" button.
	- disable duplicate payment actions while pending.
	- show estimated timeout and a contact link for support if failed/unknown.
- On confirmed: show success, receipt download link, and automatically refresh relevant pages (invoices, balances).
- On failed: show clear reason if available and guided next steps.

Sample frontend code (polling)
- Minimal fetch-based polling (replace endpoints/auth to match your app):

```javascript
// Create payment (example)
async function createPayment(amount, metadata, token) {
	const resp = await fetch('/api/payments', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
		body: JSON.stringify({ amount, metadata })
	});
	if (!resp.ok) throw new Error('Payment create failed');
	return resp.json(); // contains paymentId, checkoutUrl
}

// Polling helper
async function pollPaymentStatus(paymentId, { onUpdate, maxDuration = 120000, token } = {}) {
	const start = Date.now();
	let interval = 2000;
	while (Date.now() - start < maxDuration) {
		const resp = await fetch(`/api/payments/${paymentId}`, {
			headers: { Authorization: 'Bearer ' + token }
		});
		if (!resp.ok) throw new Error('Status check failed');
		const data = await resp.json();
		onUpdate(data);
		if (['confirmed','failed','expired'].includes(data.status)) return data;
		await new Promise(r => setTimeout(r, interval));
		// backoff
		interval = Math.min(15000, Math.floor(interval * 1.5));
	}
	return { status: 'pending', timedOut: true };
}
```

Sample WebSocket snippet (client)

```javascript
// assume a connected WebSocket `ws` and authenticated session
// subscribe to a channel after creating payment or on page load
function subscribePaymentChannel(ws, paymentId) {
	ws.send(JSON.stringify({ action: 'subscribe', channel: `payment:${paymentId}` }));
}

ws.addEventListener('message', (evt) => {
	const msg = JSON.parse(evt.data);
	if (msg.type === 'payment.updated') {
		// msg: { type: 'payment.updated', paymentId, status, confirmedAt }
		handlePaymentUpdate(msg);
	}
});
```

Sample server -> client push format

```json
{
	"type": "payment.updated",
	"paymentId": "pay_abc",
	"status": "confirmed",
	"confirmedAt": "2026-03-14T12:37:01Z"
}
```

Backend responsibilities (what frontend expects)
- Return a stable, unique `paymentId` on creation.
- Provide `GET /api/payments/:paymentId` that returns canonical, authoritative status.
- Process provider webhooks reliably and update payment status in DB.
- Implement retries for webhook delivery and/or expose event logs for debugging.
- Optionally support WebSocket push to user or payment channel.

Testing & QA checklist for frontend
- Happy path: create payment, simulate provider confirm -> UI shows confirmed.
- Redirect path: simulate provider redirect -> frontend validates and fetches status -> confirmed shown.
- Polling fallback: simulate delayed webhook -> poll returns confirmed after some retries.
- Failure and timeout: simulate "failed" status and timed-out pending -> UI shows contact/support.
- Auth failure: 401 responses -> re-auth flow tested.
- Race conditions: create payment, immediately poll -> ensure idempotency and no double-charges.

Server-to-frontend troubleshooting hints
- If frontend never sees confirmation:
	- Verify webhook reception in backend logs.
	- Verify backend updates DB and that `GET /api/payments/:paymentId` returns updated status.
	- If using push, check WebSocket server logs and that the client is subscribed to the correct channel (userId vs paymentId).
	- Check CORS/auth issues on status endpoint.

Next steps (suggested)
- I can adapt this brief to your exact backend by reading the code in `src/` and wiring the real endpoints and auth headers.
- I can add a React component implementing polling + WebSocket fallback.
- I can add backend tests or an example endpoint if you want server-side wiring.

Appendix: Quick checklist for backend implementers
- Ensure webhooks are idempotent and signed (verify signatures).
- Persist `paymentId`, `providerReference`, `status`, and timestamps atomically.
- Expose an authoritative GET `/api/payments/:paymentId`.
- Emit push events after webhook processing so frontend can receive instant updates.

---

If you want this saved elsewhere or tailored (e.g., React, Next.js, or Angular snippets), tell me which framework and I'll add it.

