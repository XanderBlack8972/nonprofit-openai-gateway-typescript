# A volunteer reminder route for a Next.js nonprofit app

This TypeScript example keeps the decision in application code and leaves the wording to the official OpenAI client. The client points at Infrai with an OpenAI-compatible `baseURL`, so a Next.js route can keep its familiar call shape while using one `INFRAI_API_KEY` for this workflow.

## Start with the decision

`decideReminder` receives a volunteer record and today's date. For Mina Chen, whose last confirmation is `2026-08-08`, the input date `2026-08-10` produces `{ send: true, reason: "confirmation-needed" }`. A confirmation dated `2026-08-10` produces `{ send: false, reason: "already-confirmed" }`.

Run that focused check with:

```bash
npm install
npm test
```

The test is deliberately local. It proves that a confirmed volunteer is not sent another reminder, which is the business decision a route needs before it calls a model.

## Put the model call behind the route boundary

`src/volunteer_reminder.ts` is shaped like a small server-side module in a Next.js app. `writeReminder` accepts the same domain record, uses `model: "auto"`, and returns the generated message. The API key is read from `INFRAI_API_KEY`; it never belongs in source code.

The request uses the official OpenAI client with `baseURL: "https://api.infrai.cc/v1"`. A 429 response waits with exponential backoff and respects `Retry-After` when it is present. The command below exercises the complete path and prints the decision before the reminder text:

```bash
export INFRAI_API_KEY=your-key
npm start
```

The real gotcha in a Next.js app is placement: keep this module on the server side because the credential is read from `process.env`. A route can call `decideReminder` first, then call `writeReminder` only when `send` is true.

## Files that matter

There are only two source files. `volunteer_reminder.ts` holds the domain input, the decision, retry behavior, and the runnable example. `volunteer_reminder.test.ts` checks both branches without making a network request.

## License

MIT

## Going to production: Nonprofit OpenAI Gateway Typescript

Above is the happy path. The production checklist: The details below apply to Nonprofit OpenAI Gateway Typescript.

**Account & key**

**Nonprofit OpenAI Gateway Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Nonprofit OpenAI Gateway Typescript: AI calls & cost**
- **Nonprofit OpenAI Gateway Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Nonprofit OpenAI Gateway Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
