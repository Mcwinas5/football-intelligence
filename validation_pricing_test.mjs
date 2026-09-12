const base = process.env.BASE_URL ?? "http://127.0.0.1:3100";
async function post(path, body) { const r = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(`${path} ${r.status}`); return r.json(); }
let a = 0, b = 0;
for (let i = 0; i < 200; i++) {
  const { prospect, assignment } = await post("/api/validation/prospects", { name: `Cohort ${i}`, phone_or_telegram: `@cohort${i}`, acquisition_source: "community" });
  const checkout = await post("/api/validation/checkout", { prospect_id: prospect.id, client_submitted_price: assignment.assigned_price === 1000 ? 2000 : 1000 });
  if (checkout.amount !== assignment.assigned_price) throw new Error("Client price altered checkout amount");
  if (assignment.variant === "A") a++; else b++;
}
console.log(JSON.stringify({ samples: 200, cohortA: a, cohortB: b, cohortAPercent: +(a / 2).toFixed(2), server_authoritative_amount: true, client_tamper_rejected: true }, null, 2));
