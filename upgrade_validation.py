from pathlib import Path
p = Path('/home/ubuntu/football-intelligence/client/src/pages/Home.tsx')
s = p.read_text()

s = s.replace('''function getPricingVariant(): PricingVariant {
  if (typeof window === "undefined") return "A";
  const existing = window.localStorage.getItem("fi_pricing_variant");
  if (existing === "A" || existing === "B") return existing;
  const variant: PricingVariant = Math.random() < 0.5 ? "A" : "B";
  window.localStorage.setItem("fi_pricing_variant", variant);
  track("pricing_variant_assigned", { pricing_variant: variant });
  return variant;
}''', '''function getAcquisitionSource() {
  if (typeof window === "undefined") return "direct";
  const params = new URLSearchParams(window.location.search);
  const allowed = ["telegram", "whatsapp", "facebook", "referral", "community", "warm-network", "organic", "direct", "other"];
  const incoming = params.get("source");
  if (incoming && allowed.includes(incoming)) window.localStorage.setItem("fi_acquisition_source", incoming);
  return window.localStorage.getItem("fi_acquisition_source") ?? "direct";
}

function getPricingVariant(): PricingVariant {
  if (typeof window === "undefined") return "A";
  const existing = window.localStorage.getItem("fi_pricing_variant");
  if (existing === "A" || existing === "B") return existing;
  const variant: PricingVariant = Math.random() < 0.5 ? "A" : "B";
  window.localStorage.setItem("fi_pricing_variant", variant);
  window.localStorage.setItem("fi_pricing_assigned_at", new Date().toISOString());
  track("pricing_variant_assigned", { pricing_variant: variant, assigned_price: formatNaira(variant), acquisition_source: getAcquisitionSource() });
  return variant;
}''')

s = s.replace('''<div className="flex items-center justify-between border-b border-white/[.1] px-4 py-3 sm:px-5"><div className="flex items-center gap-2"><ClipboardList size={15} className="text-[#d8f36a]" /><span className="mono text-[10px] tracking-[.1em] text-[#c8d6cd]">PUBLIC PREDICTION LEDGER</span></div><span className="rounded-full border border-[#d8f36a]/20 px-2 py-1 mono text-[9px] text-[#d8f36a]">DEMO DATA</span></div><div className="overflow-x-auto">''', '''<div className="flex items-center justify-between border-b border-white/[.1] px-4 py-3 sm:px-5"><div className="flex items-center gap-2"><ClipboardList size={15} className="text-[#d8f36a]" /><span className="mono text-[10px] tracking-[.1em] text-[#c8d6cd]">PUBLIC PREDICTION LEDGER</span></div><span className="rounded-full border border-[#d8f36a]/20 px-2 py-1 mono text-[9px] text-[#d8f36a]">DEMO DATA</span></div><div className="border-b border-white/[.08] bg-[#d8f36a]/[.035] px-4 py-3 text-[12px] leading-5 text-[#b9c9bd] sm:px-5">Every prediction is recorded before kickoff. Every result remains visible afterward. <span className="mono text-[10px] text-[#d8f36a]">DEMONSTRATION RECORD — NOT HISTORICAL PERFORMANCE</span></div><div className="overflow-x-auto">''')

s = s.replace('''<p className="mono mt-2 text-[11px] text-[#d7e2da]">12 September · 14:32</p>''', '''<p className="mono mt-2 text-[11px] text-[#d7e2da]">12 September · 14:32 · BEFORE KICKOFF</p>''')

s = s.replace('''<p className="mt-3 max-w-sm text-sm leading-6 text-[#9daea4]">Available evidence did not meet the predefined qualification criteria. No pick was forced.</p>''', '''<p className="mt-3 max-w-sm text-sm leading-6 text-[#9daea4]">A prediction is not published simply to keep the feed active. If predefined criteria are not met, the system records NO BET.</p>''')

needle = '''function PricingCard({ variant }: { variant: PricingVariant }) {'''
insert = '''function TelegramCard() {
  return <div className="surface overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/[.1] bg-[#17231b] px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8f36a] text-[#07110f]"><Radio size={15} /></span><div><p className="text-[12px] font-semibold text-[#e6efe7]">Football Intelligence</p><p className="mono text-[9px] text-[#82968a]">SAMPLE INTERFACE · TELEGRAM DELIVERY</p></div></div><span className="mono text-[9px] text-[#d8f36a]">14:32</span></div><div className="bg-[#0b1713] p-5 sm:p-7"><div className="flex items-center justify-between"><span className="eyebrow text-[#72867a]">EPL · QUALIFYING SIGNAL</span><span className="rounded-full bg-[#d8f36a]/10 px-2 py-1 mono text-[9px] text-[#d8f36a]">PUBLISHED BEFORE KICKOFF</span></div><h3 className="display mt-5 text-2xl font-semibold text-[#eff7ef]">Arsenal vs Chelsea</h3><p className="mt-1 text-sm text-[#9aaba1]">Over 2.5 Goals · Selection: Over</p><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="MODEL PROBABILITY" value="64%" accent /><Metric label="MARKET ODDS" value="1.72" /><Metric label="IMPLIED PROBABILITY" value="58.1%" /><Metric label="ESTIMATED EDGE" value="+5.9pp" accent /></div><div className="mt-5 grid gap-3 border-t border-white/[.1] pt-4 sm:grid-cols-2"><div><p className="eyebrow text-[#72867a]">CONFIDENCE</p><p className="mt-2 text-sm text-[#dce8df]">Medium</p></div><div><p className="eyebrow text-[#72867a]">RISK FLAGS</p><p className="mt-2 text-sm text-[#dce8df]">Lineup uncertainty · Scoring volatility</p></div></div><div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 border-t border-white/[.1] pt-4"><span className="mono text-[10px] text-[#8fa198]">PUBLISHED 12 SEP · 14:32</span><span className="mono text-[10px] text-[#8fa198]">ID FI-20260912-0042</span><span className="mono text-[10px] text-[#d8f36a]">STATUS PENDING</span></div></div></div>;
}

function YourSevenDays() {
  const steps = ["Join the Telegram feed", "Receive qualifying EPL intelligence before kickoff", "Review the probability, price and risk context", "Results are settled and recorded", "Inspect the complete historical record", "Decide whether the intelligence is worth continuing"];
  return <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{steps.map((step, index) => <div key={step} className="rounded-xl border border-white/[.11] bg-white/[.025] p-5"><span className="mono text-[10px] text-[#d8f36a]">{String(index + 1).padStart(2, "0")}</span><p className="mt-4 text-sm leading-6 text-[#c4d1c7]">{step}</p></div>)}</div>;
}

'''
s = s.replace(needle, insert + needle)

s = s.replace('''    <section id="trial" className="scroll-mt-24 border-b border-white/[.08] bg-[#0b1713] py-16 sm:py-24"><div className="container grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><div><SectionIntro label="07 / VALIDATION TRIAL" title="Try the intelligence for 7 days." copy="Get direct access to the daily Football Intelligence feed through Telegram and see how the system performs in real time." /><p className="mt-5 text-[12px] leading-5 text-[#7f9287]">A/B pricing is assigned once and preserved for the duration of the experiment. No auto-renewal.</p></div><PricingCard variant={variant} /></div></section>''', '''    <section className="border-b border-white/[.08] bg-[#0b1713] py-16 sm:py-24"><div className="container"><SectionIntro label="07 / TELEGRAM DELIVERY" title="What arrives in your Telegram." copy="A concise, structured intelligence card — not a screenshot, not a guarantee. Sample data is shown for interface demonstration only." /><div className="mt-10"><TelegramCard /></div><p className="mt-4 text-[12px] text-[#8fa198]">1–3 qualifying signals per day. If nothing meets the criteria, we say NO BET.</p></div></section>
    <section className="border-b border-white/[.08] py-16 sm:py-24"><div className="container"><SectionIntro label="08 / YOUR 7 DAYS" title="A short trial. A complete record." copy="The point is to evaluate the intelligence in context, then decide whether it is worth continuing." /><YourSevenDays /></div></section>
    <section id="trial" className="scroll-mt-24 border-b border-white/[.08] bg-[#0b1713] py-16 sm:py-24"><div className="container grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><div><SectionIntro label="09 / VALIDATION TRIAL" title="Try the intelligence for 7 days." copy="Get direct access to the daily Football Intelligence feed through Telegram and see how the system performs in real time." /><p className="mt-5 rounded-lg border border-[#d8f36a]/15 bg-[#d8f36a]/[.04] p-4 text-[13px] leading-6 text-[#c2d0c4]">Football Intelligence is a 7-day Telegram service delivering pre-match EPL probabilities, odds context and risk information, backed by a public prediction record.</p><p className="mt-4 text-[12px] leading-5 text-[#7f9287]">A/B pricing is assigned once and preserved for the duration of the experiment. No auto-renewal.</p></div><PricingCard variant={variant} /></div></section>''')

s = s.replace('''<div className="flex items-center justify-between border-b border-white/[.1] px-4 py-3 sm:px-5"><div className="flex items-center gap-2"><ClipboardList size={15} className="text-[#d8f36a]" /><span className="mono text-[10px] tracking-[.1em] text-[#c8d6cd]">PUBLIC PREDICTION LEDGER</span></div><span className="rounded-full border border-[#d8f36a]/20 px-2 py-1 mono text-[9px] text-[#d8f36a]">DEMO DATA</span></div><div className="overflow-x-auto">''', '''<div className="flex items-center justify-between border-b border-white/[.1] px-4 py-3 sm:px-5"><div className="flex items-center gap-2"><ClipboardList size={15} className="text-[#d8f36a]" /><span className="mono text-[10px] tracking-[.1em] text-[#c8d6cd]">PUBLIC PREDICTION LEDGER</span></div><span className="rounded-full border border-[#d8f36a]/20 px-2 py-1 mono text-[9px] text-[#d8f36a]">DEMO DATA</span></div><div className="border-b border-white/[.08] bg-[#d8f36a]/[.035] px-4 py-3 text-[12px] leading-5 text-[#b9c9bd] sm:px-5">Every prediction is recorded before kickoff. Every result remains visible afterward. <span className="mono text-[10px] text-[#d8f36a]">DEMONSTRATION RECORD — NOT HISTORICAL PERFORMANCE</span></div><div className="overflow-x-auto">''')

old = '''  const [form, setForm] = useState({ name: "", contact: "", source: "direct" });'''
new = '''  const [form, setForm] = useState({ name: "", contact: "", source: getAcquisitionSource() });'''
s = s.replace(old, new)

s = s.replace('''  useEffect(() => track("page_view", { page: "trial", pricing_variant: variant }), [variant]);''', '''  useEffect(() => track("page_view", { page: "trial", pricing_variant: variant, assigned_price: formatNaira(variant), acquisition_source: getAcquisitionSource() }), [variant]);''')

s = s.replace('''track("checkout_started", { pricing_variant: variant, amount: formatNaira(variant) }); track("payment_completed", { status: "demo_form_submitted", pricing_variant: variant }); setSubmitted(true);''', '''const prospectId = window.localStorage.getItem("fi_prospect_id") ?? `prospect-${Date.now()}`; window.localStorage.setItem("fi_prospect_id", prospectId); window.localStorage.setItem("fi_signup", JSON.stringify({ prospect_id: prospectId, name: form.name, contact: form.contact, acquisition_source: form.source, pricing_variant: variant, assigned_price: formatNaira(variant), assigned_at: window.localStorage.getItem("fi_pricing_assigned_at") ?? new Date().toISOString(), payment_status: "pending", payment_amount: formatNaira(variant), payment_reference: "", purchased_at: "" })); track("checkout_started", { prospect_id: prospectId, pricing_variant: variant, assigned_price: formatNaira(variant), acquisition_source: form.source }); setSubmitted(true);''')

s = s.replace('''<p className="mt-2 text-sm leading-6 text-[#9fb0a5]">This static build is ready to connect to checkout and Telegram activation. Your assigned cohort is {variant} at {formatNaira(variant)}.</p>''', '''<p className="mt-2 text-sm leading-6 text-[#9fb0a5]">Your signup is captured with cohort {variant} at {formatNaira(variant)}. Payment and Telegram activation remain the next integration steps; no payment has been processed in this static validation build.</p><div className="mt-5 rounded-lg border border-[#f3c978]/20 bg-[#f3c978]/[.05] p-4 text-[12px] leading-5 text-[#cdbf9f]">Owner action required: connect a reviewed payment provider, then record payment reference, payment status, amount and purchase timestamp before enabling live checkout.</div>''')

p.write_text(s)
print('upgraded', p)
