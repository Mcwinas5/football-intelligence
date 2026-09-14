// Pricing consistency test — proves the server-authoritative pricing flow
// (see AGENTS.md). Requires a running non-production server:
//   ADMIN_TOKEN=dev-admin-token PORT=3100 npx tsx server/index.ts
// BASE_URL defaults to http://127.0.0.1:3100.
const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";

async function post(path, body) {
  const r = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}) });
  const data = await r.json();
  if (!r.ok) throw new Error(`${path}: ${r.status} ${JSON.stringify(data)}`);
  return data;
}
function assert(condition, message) { if (!condition) throw new Error(`FAIL: ${message}`); }
const priceFor = (variant) => variant === "A" ? 1000 : 2000;

// 1. Variant → price mapping: every fresh server assignment is internally consistent,
//    and both variants occur across a reasonable sample.
const seen = { A: 0, B: 0 };
for (let i = 0; i < 40; i++) {
  const { assignment } = await post("/api/validation/pricing-assignment");
  assert(assignment.variant === "A" || assignment.variant === "B", `unknown variant ${assignment.variant}`);
  assert(assignment.assigned_price === priceFor(assignment.variant), `variant ${assignment.variant} must map to ₦${priceFor(assignment.variant)}, got ₦${assignment.assigned_price}`);
  assert(!assignment.prospect_id, "fresh assignment must not be bound to a prospect");
  seen[assignment.variant]++;
}
assert(seen.A > 0 && seen.B > 0, `expected both variants in 40 draws, got A=${seen.A} B=${seen.B}`);
console.log(`  mapping OK: A=₦1,000 (n=${seen.A}) · B=₦2,000 (n=${seen.B}) across 40 server assignments`);

// 2. Repeated requests never silently change the assigned variant.
{
  const first = (await post("/api/validation/pricing-assignment")).assignment;
  for (let i = 0; i < 5; i++) {
    const again = (await post("/api/validation/pricing-assignment", { assignment_id: first.id })).assignment;
    assert(again.id === first.id && again.variant === first.variant && again.assigned_price === first.assigned_price, "assignment changed on repeated request");
  }
  console.log(`  stability OK: ${first.variant}/₦${first.assigned_price} unchanged across 5 re-validations`);
}

// 3. The client cannot inject a variant, price, or fabricated assignment id.
{
  const injected = (await post("/api/validation/pricing-assignment", { assignment_id: "fabricated-client-id", variant: "B", assigned_price: 1, assigned_price_ngn: 1, price: 999 })).assignment;
  assert(injected.id !== "fabricated-client-id", "server accepted a fabricated assignment id");
  assert(injected.assigned_price === priceFor(injected.variant), `server accepted client price ${injected.assigned_price}`);
  console.log(`  injection rejected: server returned its own assignment ${injected.variant}/₦${injected.assigned_price}`);
}

// 4. Displayed (pre-signup) assignment and recorded (prospect) assignment are identical.
{
  const displayed = (await post("/api/validation/pricing-assignment")).assignment;
  const tampered = await post("/api/validation/prospects", {
    name: "Consistency Mock", phone_or_telegram: "@consistency", acquisition_source: "telegram",
    assignment_id: displayed.id,
    variant: displayed.variant === "A" ? "B" : "A", // hostile client payload — must be ignored
    assigned_price: 999999,
    assigned_price_ngn: 999999,
  });
  const recorded = tampered.assignment;
  assert(recorded.id === displayed.id, "displayed assignment id != recorded assignment id");
  assert(recorded.variant === displayed.variant, `displayed variant ${displayed.variant} != recorded variant ${recorded.variant}`);
  assert(recorded.assigned_price === displayed.assigned_price, "displayed price != recorded price");

  const checkout = await post("/api/validation/checkout", { prospect_id: tampered.prospect.id, client_submitted_price: 1, amount: 1, assigned_price: 999999 });
  assert(checkout.amount === displayed.assigned_price, `checkout amount ${checkout.amount} does not match server-assigned ₦${displayed.assigned_price}`);

  const checkoutAgain = await post("/api/validation/checkout", { prospect_id: tampered.prospect.id });
  assert(checkoutAgain.amount === displayed.assigned_price, "checkout amount changed between requests");

  console.log(`  binding OK: displayed ${displayed.variant}/₦${displayed.assigned_price} === recorded; checkout ₦${checkout.amount} (client ${JSON.stringify({ client_submitted_price: 1, amount: 1 })} ignored)`);
}

// 5. One assignment binds to exactly one prospect; a retry gets its own server assignment.
{
  const shared = (await post("/api/validation/pricing-assignment")).assignment;
  const p1 = await post("/api/validation/prospects", { name: "First", phone_or_telegram: "@first", assignment_id: shared.id });
  const p2 = await post("/api/validation/prospects", { name: "Second", phone_or_telegram: "@second", assignment_id: shared.id });
  assert(p1.assignment.id === shared.id, "first prospect must bind the pre-signup assignment");
  assert(p2.assignment.id !== shared.id, "second prospect must not reuse a bound assignment");
  assert(p2.assignment.assigned_price === priceFor(p2.assignment.variant), "second prospect assignment internally inconsistent");
  const c1 = await post("/api/validation/checkout", { prospect_id: p1.prospect.id });
  const c2 = await post("/api/validation/checkout", { prospect_id: p2.prospect.id });
  assert(c1.amount === p1.assignment.assigned_price && c2.amount === p2.assignment.assigned_price, "checkout amounts must follow their own prospect's assignment");
  console.log(`  single-binding OK: p1 ${p1.assignment.variant}/₦${c1.amount} · p2 ${p2.assignment.variant}/₦${c2.amount} (independent assignments)`);
}

console.log(JSON.stringify({ ok: true, test: "pricing_consistency", server_authoritative: true, client_tamper_rejected: true, displayed_equals_recorded: true, stable_on_repeat: true }, null, 2));
