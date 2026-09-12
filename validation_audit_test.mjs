const allowed = ["telegram", "whatsapp", "facebook", "referral", "community", "warm-network", "organic", "direct", "other"];
function assign(existing, randomValue) {
  if (existing === "A" || existing === "B") return existing;
  return randomValue < 0.5 ? "A" : "B";
}
function amount(variant) { return variant === "A" ? "₦1,000" : "₦2,000"; }

const samples = 10000;
let a = 0, b = 0;
for (let i = 0; i < samples; i++) {
  const v = assign(null, Math.random());
  if (v === "A") a++; else b++;
}
const ratio = a / samples;
if (Math.abs(ratio - 0.5) > 0.03) throw new Error(`Distribution outside 3pp: A=${a}, B=${b}`);
if (assign("A", 0.99) !== "A" || assign("B", 0.01) !== "B") throw new Error("Persistence rule failed");
if (amount("A") !== "₦1,000" || amount("B") !== "₦2,000") throw new Error("Amount mapping failed");
for (const source of ["telegram", "whatsapp", "facebook", "referral", "community"]) {
  if (!allowed.includes(source)) throw new Error(`Source rejected: ${source}`);
}
console.log(JSON.stringify({ samples, cohortA: a, cohortB: b, cohortAPercent: +(ratio * 100).toFixed(2), exactMapping: true, persistence: true, acceptedSources: ["telegram", "whatsapp", "facebook", "referral", "community"] }, null, 2));
