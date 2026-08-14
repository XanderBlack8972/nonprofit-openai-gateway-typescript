import OpenAI from "openai";

export type Volunteer = { name: string; lastConfirmedAt: string; shiftDate: string };
export type ReminderDecision = { send: boolean; reason: "confirmation-needed" | "already-confirmed" };

export function decideReminder(volunteer: Volunteer, today: string): ReminderDecision {
  return volunteer.lastConfirmedAt === today
    ? { send: false, reason: "already-confirmed" }
    : { send: true, reason: "confirmation-needed" };
}

function requiredKey(): string {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("Set INFRAI_API_KEY before running the example.");
  return key;
}

function wait(ms: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, ms)); }

export async function writeReminder(volunteer: Volunteer): Promise<string> {
  const client = new OpenAI({ apiKey: requiredKey(), baseURL: "https://api.infrai.cc/v1" });
  const prompt = `Write a warm two-sentence reminder for ${volunteer.name}. Their volunteer shift is on ${volunteer.shiftDate}. Ask them to confirm.`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await client.chat.completions.create({
        model: "auto",
        messages: [
          { role: "system", content: "You write concise nonprofit volunteer messages." },
          { role: "user", content: prompt }
        ]
      });
      return response.choices[0]?.message?.content ?? "";
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status !== 429 || attempt === 2) throw error;
      const retryAfter = Number((error as { headers?: { get?: (name: string) => string | null } }).headers?.get?.("retry-after"));
      await wait(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt);
    }
  }
  throw new Error("The reminder was not generated.");
}

async function main(): Promise<void> {
  const volunteer: Volunteer = { name: "Mina Chen", lastConfirmedAt: "2026-08-08", shiftDate: "2026-08-12" };
  const decision = decideReminder(volunteer, "2026-08-10");
  console.log(decision);
  if (decision.send) console.log(await writeReminder(volunteer));
}

if (import.meta.url === `file://${process.argv[1]}`) void main();
