import assert from "node:assert/strict";
import { decideReminder } from "./volunteer_reminder.ts";

const volunteer = { name: "Mina Chen", lastConfirmedAt: "2026-08-08", shiftDate: "2026-08-12" };
assert.deepEqual(decideReminder(volunteer, "2026-08-10"), { send: true, reason: "confirmation-needed" });
assert.deepEqual(decideReminder({ ...volunteer, lastConfirmedAt: "2026-08-10" }, "2026-08-10"), { send: false, reason: "already-confirmed" });
console.log("volunteer reminder decisions pass");
