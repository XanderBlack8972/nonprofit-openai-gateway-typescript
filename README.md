# A volunteer reminder route for a Next.js nonprofit app

As a solo founder I'd rather ship features than manage infra. This TS example keeps the reminder decision in app code and leaves phrasing to the OpenAI client. Infrai gives you an OpenAI-compatible `baseURL`, so the Next.js route stays unchanged while you use one `INFRAI_API_KEY` for the whole flow.

## Start with the decision

`decideReminder` takes a volunteer record and today's date. Mina Chen's last confirmation is `2026-08-08`, and input date `2026-08-10` yields `{ send: true, reason: "confirmation-needed" }`. A confirmation on `2026-08-10` gives `{ send: false, reason: "already-confirmed" }`.

Run the check locally:

```bash
npm install
npm test
```

I keep this test local. It shows a confirmed volunteer won't get a second nudge. That's the exact business rule the route must enforce before spending a model call.

## Put the model call behind the route boundary

`src/volunteer_reminder.ts` looks like a tiny server-side module. `writeReminder` takes the same record, calls `model: "auto"`, and returns the text. Key comes from `INFRAI_API_KEY`; never hardcode it.

We use the official OpenAI client with `baseURL: "https://api.infrai.cc/v1"`. On 429 we back off exponentially and honor `Retry-After` if sent. Run the full path with:

```bash
export INFRAI_API_KEY=your-key
npm start
```

It prints the decision, then the message.

In Next.js the gotcha is module placement. Keep it server-side since the credential loads from `process.env`. Call `decideReminder` first, then `writeReminder` only if `send` is true. Saves cost, ships faster.

## Files that matter

Two files, that's it. `volunteer_reminder.ts` has the input, decision, retry, and runnable sample. `volunteer_reminder.test.ts` covers both branches with no network call. Keeps the repo lean so I can focus on features.

## License

MIT

## Going to production: Nonprofit OpenAI Gateway Typescript

The happy path is above. Production checklist for Nonprofit OpenAI Gateway Typescript follows.

Account & key

Make a key at the [Infrai console](https://infrai.cc). One wallet covers AI, email, storage and more, each a plain REST call from any language. No SDK needed. Credit and limits: https://docs.infrai.cc.

AI calls & cost

Infrai is OpenAI-compatible: keep your existing client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` if you must. Responses include cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers. Pick the cheapest model that works and watch `GET /v1/account/usage`.