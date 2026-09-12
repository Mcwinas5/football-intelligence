import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileCheck2,
  Gauge,
  GitBranch,
  Info,
  LockKeyhole,
  Menu,
  Minus,
  OctagonAlert,
  Radio,
  Scale,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

export type PricingVariant = "A" | "B";

type LedgerRecord = {
  time: string;
  match: string;
  market: string;
  pick: string;
  odds: string;
  probability: string;
  result: "WON" | "LOST" | "—";
  tone: "win" | "loss" | "neutral";
};

const ledgerRecords: LedgerRecord[] = [
  { time: "12:02", match: "Arsenal vs Chelsea", market: "O2.5", pick: "Over", odds: "1.72", probability: "64%", result: "WON", tone: "win" },
  { time: "14:17", match: "Liverpool vs Newcastle", market: "BTTS", pick: "Yes", odds: "1.81", probability: "59%", result: "LOST", tone: "loss" },
  { time: "16:04", match: "Tottenham vs Villa", market: "O2.5", pick: "NO BET", odds: "—", probability: "48%", result: "—", tone: "neutral" },
  { time: "18:41", match: "Brighton vs West Ham", market: "BTTS", pick: "Yes", odds: "1.67", probability: "62%", result: "WON", tone: "win" },
];

const faqs = [
  ["Does this guarantee winning bets?", "No. Football outcomes are uncertain. The product provides statistical probabilities and odds context, not certainty."],
  ["How are predictions generated?", "Statistical analysis is combined with a human review of data quality, match context and market conditions."],
  ["Do you hide losing predictions?", "No. Historical predictions remain part of the record. Losses are not removed to make the numbers look better."],
  ["What competitions and markets do you cover?", "The initial validation focuses on the English Premier League, with Over/Under 2.5 Goals and BTTS markets."],
  ["How are predictions delivered?", "Through Telegram. Paid subscribers receive current intelligence immediately; public records are released after a delay."],
  ["Do you place bets for customers?", "No. Football Intelligence is not a sportsbook, does not accept stakes and does not handle betting funds."],
  ["Is the trial automatically renewed?", "No. The 7-day trial has no automatic renewal."],
  ["What happens if there is no qualifying prediction?", "The system can issue a NO BET signal. Not generating a pick is a valid decision when the evidence is not strong enough."],
];

function track(event: string, data: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...data, timestamp: new Date().toISOString() };
  window.__fiEvents = [...(window.__fiEvents ?? []), payload];
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

declare global {
  interface Window {
    __fiEvents?: Array<Record<string, string>>;
    dataLayer?: Array<Record<string, string>>;
  }
}

function getAcquisitionSource() {
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
}

function formatNaira(variant: PricingVariant) {
  return variant === "A" ? "₦1,000" : "₦2,000";
}

function usePricingVariant() {
  const [variant, setVariant] = useState<PricingVariant>("A");
  useEffect(() => setVariant(getPricingVariant()), []);
  return variant;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Football Intelligence home">
      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#d8f36a] text-[#07110f] shadow-[0_0_26px_rgba(216,243,106,.2)]">
        <span className="display text-[15px] font-bold">FI</span>
      </span>
      <span className="display text-[15px] font-bold tracking-[-.04em] text-[#ecf3ee]">FOOTBALL <span className="text-[#d8f36a]">INTELLIGENCE</span></span>
    </Link>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [["Ledger", "/ledger"], ["Methodology", "/methodology"], ["Responsible use", "/responsible-use"]];
  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#07110f]/85 backdrop-blur-xl">
      <div className="container flex h-[68px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {links.map(([label, href]) => <Link key={href} href={href} className="text-[13px] text-[#a6b5ad] transition-colors hover:text-[#d8f36a]">{label}</Link>)}
          <Link href="/trial" onClick={() => track("trial_cta_clicked", { source: "nav" })} className="btn btn-primary !min-h-[38px] !px-4 !py-2 !text-[12px]">Start 7-day trial <ArrowUpRight size={14} /></Link>
        </nav>
        <button className="rounded-md p-2 text-[#d8f36a] md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
      {open && <nav className="container flex flex-col gap-4 border-t border-white/[.07] py-5 md:hidden" aria-label="Mobile navigation">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="text-sm text-[#becbc3]">{label}</Link>)}<Link href="/trial" onClick={() => { setOpen(false); track("trial_cta_clicked", { source: "mobile_nav" }); }} className="btn btn-primary mt-1 w-full">Start 7-day trial <ArrowUpRight size={15} /></Link></nav>}
    </header>
  );
}

function TrustPill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "accent" | "red" }) {
  const styles = tone === "accent" ? "border-[#d8f36a]/25 bg-[#d8f36a]/[.08] text-[#d8f36a]" : tone === "red" ? "border-[#ff8888]/25 bg-[#ff8888]/[.06] text-[#ff9d9d]" : "border-white/[.13] bg-white/[.03] text-[#adbbb3]";
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] ${styles}`}>{children}</span>;
}

function ProductInterface() {
  return (
    <div className="relative mx-auto w-full max-w-[590px] reveal reveal-delay-2">
      <div className="absolute -inset-8 rounded-[40px] bg-[#d8f36a]/[.045] blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/[.14] bg-[#0b1814] shadow-[0_28px_90px_rgba(0,0,0,.45)]">
        <div className="flex items-center justify-between border-b border-white/[.1] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#d8f36a] shadow-[0_0_12px_#d8f36a]" /><span className="mono text-[10px] tracking-[.12em] text-[#a8b8ae]">FI / INTELLIGENCE DESK</span></div>
          <span className="mono text-[9px] text-[#60736a]">SAMPLE INTERFACE</span>
        </div>
        <div className="grid-lines p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between"><span className="eyebrow text-[#657a6e]">QUALIFYING SIGNAL · EPL</span><span className="mono text-[10px] text-[#8ea197]">12 SEP 2026</span></div>
          <div className="surface rounded-xl p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="eyebrow mb-2 text-[#72857a]">MATCH</p><p className="display text-[22px] font-semibold text-[#f4f8f4] sm:text-[27px]">Arsenal <span className="text-[#708077]">vs</span> Chelsea</p></div><span className="rounded-md bg-[#d8f36a]/10 px-2 py-1 mono text-[10px] text-[#d8f36a]">PENDING</span></div>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/[.09] pt-4"><div><p className="eyebrow mb-1 text-[#72857a]">MARKET</p><p className="text-sm font-semibold text-[#e7efe9]">Over 2.5 Goals</p></div><div className="text-left sm:text-right"><p className="eyebrow mb-1 text-[#72857a]">PICK</p><p className="text-sm font-semibold text-[#d8f36a]">Over</p></div></div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="MODEL PROB." value="64%" accent /><Metric label="MARKET ODDS" value="1.72" /><Metric label="IMPLIED PROB." value="58.1%" /><Metric label="EST. EDGE" value="+5.9pp" accent /></div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1.35fr_.65fr]"><div className="surface rounded-xl p-4"><div className="flex items-center justify-between"><span className="eyebrow text-[#72857a]">WHY THIS QUALIFIES</span><FileCheck2 size={16} className="text-[#d8f36a]" /></div><p className="mt-3 text-[12px] leading-5 text-[#a6b5ad]">A model probability above the market-implied threshold, reviewed against current team context.</p><div className="mt-4 flex flex-wrap gap-2"><TrustPill tone="accent">Confidence · Medium</TrustPill><TrustPill>Risk flags · 02</TrustPill></div></div><div className="surface rounded-xl p-4"><span className="eyebrow text-[#72857a]">PREDICTION ID</span><p className="mono mt-3 text-[12px] text-[#dce8df]">FI-20260912-0042</p><div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#84968c]"><Clock3 size={13} /> 12 Sep · 14:32</div></div></div>
          <div className="surface mt-3 flex items-center justify-between rounded-xl px-4 py-3"><div className="flex items-center gap-2"><CircleAlert size={15} className="text-[#ff9292]" /><span className="text-[11px] text-[#c6d2ca]">One visible loss in the public record</span></div><span className="mono text-[10px] text-[#ff9292]">NO DELETIONS</span></div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-3 hidden rounded-xl border border-[#ff8888]/20 bg-[#15201b] p-3 shadow-xl sm:block"><div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ff8888]/10"><X size={13} className="text-[#ff9292]" /></span><div><p className="mono text-[9px] text-[#ff9d9d]">DEMONSTRATION RECORD</p><p className="mt-1 text-[11px] text-[#aab8b0]">LOST · Liverpool vs Newcastle</p></div></div></div>
    </div>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-lg border border-white/[.08] bg-black/10 p-3"><p className="mono text-[8px] leading-3 text-[#72857a]">{label}</p><p className={`display mt-1 text-[19px] font-semibold ${accent ? "text-[#d8f36a]" : "text-[#e8f0ea]"}`}>{value}</p></div>;
}

function SectionIntro({ label, title, copy, align = "left" }: { label: string; title: string; copy?: string; align?: "left" | "center" }) {
  return <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}><p className="section-label">{label}</p><h2 className="display mt-4 text-balance text-4xl font-semibold leading-[.98] text-[#eff6f0] sm:text-5xl">{title}</h2>{copy && <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#9eafa5]">{copy}</p>}</div>;
}

function CTAButtons({ source = "section" }: { source?: string }) {
  return <div className="flex flex-col gap-3 sm:flex-row"><Link href="/trial" onClick={() => track(source === "hero" ? "hero_trial_clicked" : "trial_clicked", { source })} className="btn btn-primary">Start the 7-day trial <ArrowUpRight size={16} /></Link><a href="#ledger" onClick={() => track("ledger_viewed", { source })} className="btn btn-ghost">Inspect the prediction ledger <ArrowRight size={16} /></a></div>;
}

function LedgerTable({ full = false }: { full?: boolean }) {
  const records = full ? ledgerRecords : ledgerRecords.slice(0, 3);
  return <div className="overflow-hidden rounded-xl border border-white/[.12] bg-[#0b1713]"><div className="flex items-center justify-between border-b border-white/[.1] px-4 py-3 sm:px-5"><div className="flex items-center gap-2"><ClipboardList size={15} className="text-[#d8f36a]" /><span className="mono text-[10px] tracking-[.1em] text-[#c8d6cd]">PUBLIC PREDICTION LEDGER</span></div><span className="rounded-full border border-[#d8f36a]/20 px-2 py-1 mono text-[9px] text-[#d8f36a]">DEMO DATA</span></div><div className="border-b border-white/[.08] bg-[#d8f36a]/[.035] px-4 py-3 text-[12px] leading-5 text-[#b9c9bd] sm:px-5">Every prediction is recorded before kickoff. Every result remains visible afterward. <span className="mono text-[10px] text-[#d8f36a]">DEMONSTRATION RECORD — NOT HISTORICAL PERFORMANCE</span></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="border-b border-white/[.08] text-[10px] uppercase tracking-[.12em] text-[#687a70]"><th className="px-4 py-3 font-medium sm:px-5">Time</th><th className="px-4 py-3 font-medium">Match</th><th className="px-4 py-3 font-medium">Market</th><th className="px-4 py-3 font-medium">Pick</th><th className="px-4 py-3 font-medium">Odds</th><th className="px-4 py-3 font-medium">Probability</th><th className="px-4 py-3 font-medium">Result</th></tr></thead><tbody>{records.map((record) => <tr key={`${record.time}-${record.match}`} className="border-b border-white/[.06] last:border-0 hover:bg-white/[.025]"><td className="px-4 py-4 mono text-[11px] text-[#8a9a91] sm:px-5">{record.time}</td><td className="px-4 py-4 text-[12px] font-medium text-[#e3ece5]">{record.match}</td><td className="px-4 py-4 mono text-[11px] text-[#a7b5ac]">{record.market}</td><td className={`px-4 py-4 text-[12px] font-semibold ${record.pick === "NO BET" ? "text-[#f3c978]" : "text-[#d8f36a]"}`}>{record.pick}</td><td className="px-4 py-4 mono text-[11px] text-[#a7b5ac]">{record.odds}</td><td className="px-4 py-4 mono text-[11px] text-[#dce8df]">{record.probability}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 mono text-[9px] ${record.tone === "win" ? "bg-[#d8f36a]/10 text-[#d8f36a]" : record.tone === "loss" ? "bg-[#ff8888]/10 text-[#ff9d9d]" : "bg-white/[.06] text-[#94a49b]"}`}>{record.tone === "win" ? <CircleCheck size={11} /> : record.tone === "loss" ? <X size={11} /> : <Minus size={11} />}{record.result}</span></td></tr>)}</tbody></table></div></div>;
}

function HowItWorks() {
  const steps = [["01", "ANALYSE", "Statistical models evaluate the available football data.", Gauge], ["02", "REVIEW", "A human reviewer checks data quality, match information and market conditions.", ShieldCheck], ["03", "PUBLISH", "Only qualifying predictions are published before kickoff.", Radio], ["04", "RECORD", "The original prediction remains part of the public historical record.", ClipboardList]] as const;
  return <div className="mt-12 grid gap-3 lg:grid-cols-4">{steps.map(([number, title, copy, Icon], index) => <div key={title} className="relative rounded-xl border border-white/[.11] bg-white/[.025] p-5 transition-colors hover:border-[#d8f36a]/25"><div className="flex items-center justify-between"><span className="mono text-[11px] text-[#d8f36a]">{number}</span><Icon size={18} className="text-[#7f9589]" /></div><h3 className="display mt-10 text-lg font-semibold text-[#eaf2eb]">{title}</h3><p className="mt-3 text-[13px] leading-6 text-[#8fa199]">{copy}</p>{index < 3 && <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/[.14] bg-[#07110f] lg:flex"><ArrowRight size={12} className="text-[#d8f36a]" /></span>}</div>)}</div>;
}

function IntelligenceCard() {
  return <div className="surface rounded-2xl p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[#6e8176]">SAMPLE INTERFACE</p><h3 className="display mt-3 text-2xl font-semibold text-[#eff7f0]">Arsenal vs Chelsea</h3><p className="mt-1 text-sm text-[#9baea3]">Over 2.5 Goals</p></div><span className="rounded-full border border-[#d8f36a]/20 bg-[#d8f36a]/[.07] px-3 py-1.5 mono text-[10px] text-[#d8f36a]">PENDING</span></div><div className="my-6 h-px bg-white/[.1]" /><div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4"><Metric label="MODEL PROBABILITY" value="64%" accent /><Metric label="MARKET ODDS" value="1.72" /><Metric label="IMPLIED PROBABILITY" value="58.1%" /><Metric label="ESTIMATED EDGE" value="+5.9pp" accent /></div><div className="mt-6 grid gap-4 border-t border-white/[.1] pt-5 sm:grid-cols-2"><div><p className="eyebrow text-[#6e8176]">WHY</p><p className="mt-2 text-sm leading-6 text-[#b5c2ba]">Short evidence-based explanation. Model output is reviewed before publication.</p></div><div><p className="eyebrow text-[#6e8176]">RISK FLAGS</p><div className="mt-2 flex flex-wrap gap-2"><TrustPill>Lineup uncertainty</TrustPill><TrustPill>Scoring volatility</TrustPill></div></div></div><div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/[.1] pt-5"><div><p className="eyebrow text-[#6e8176]">PUBLISHED</p><p className="mono mt-2 text-[11px] text-[#d7e2da]">12 September · 14:32 · BEFORE KICKOFF</p></div><div><p className="eyebrow text-[#6e8176]">PREDICTION ID</p><p className="mono mt-2 text-[11px] text-[#d7e2da]">FI-20260912-0042</p></div></div></div>;
}

function NoBetCard() {
  return <div className="surface flex flex-col justify-between rounded-2xl p-6 sm:p-8"><div className="flex items-center justify-between"><span className="rounded-lg bg-[#f3c978]/10 p-3 text-[#f3c978]"><OctagonAlert size={22} /></span><span className="mono text-[10px] text-[#6f8277]">DEMONSTRATION RECORD</span></div><div className="mt-12"><p className="eyebrow text-[#778a7f]">QUALIFICATION STATUS</p><p className="display mt-3 text-4xl font-semibold text-[#f3c978]">NO BET</p><p className="mt-3 max-w-sm text-sm leading-6 text-[#9daea4]">A prediction is not published simply to keep the feed active. If predefined criteria are not met, the system records NO BET.</p></div><div className="mt-8 border-t border-white/[.1] pt-4"><div className="flex items-center justify-between text-[11px] text-[#84978c]"><span>Signal integrity</span><span className="mono text-[#d8f36a]">PRESERVED</span></div></div></div>;
}

function TelegramCard() {
  return <div className="surface overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/[.1] bg-[#17231b] px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8f36a] text-[#07110f]"><Radio size={15} /></span><div><p className="text-[12px] font-semibold text-[#e6efe7]">Football Intelligence</p><p className="mono text-[9px] text-[#82968a]">SAMPLE INTERFACE · TELEGRAM DELIVERY</p></div></div><span className="mono text-[9px] text-[#d8f36a]">14:32</span></div><div className="bg-[#0b1713] p-5 sm:p-7"><div className="flex items-center justify-between"><span className="eyebrow text-[#72867a]">EPL · QUALIFYING SIGNAL</span><span className="rounded-full bg-[#d8f36a]/10 px-2 py-1 mono text-[9px] text-[#d8f36a]">PUBLISHED BEFORE KICKOFF</span></div><h3 className="display mt-5 text-2xl font-semibold text-[#eff7ef]">Arsenal vs Chelsea</h3><p className="mt-1 text-sm text-[#9aaba1]">Over 2.5 Goals · Selection: Over</p><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="MODEL PROBABILITY" value="64%" accent /><Metric label="MARKET ODDS" value="1.72" /><Metric label="IMPLIED PROBABILITY" value="58.1%" /><Metric label="ESTIMATED EDGE" value="+5.9pp" accent /></div><div className="mt-5 grid gap-3 border-t border-white/[.1] pt-4 sm:grid-cols-2"><div><p className="eyebrow text-[#72867a]">CONFIDENCE</p><p className="mt-2 text-sm text-[#dce8df]">Medium</p></div><div><p className="eyebrow text-[#72867a]">RISK FLAGS</p><p className="mt-2 text-sm text-[#dce8df]">Lineup uncertainty · Scoring volatility</p></div></div><div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 border-t border-white/[.1] pt-4"><span className="mono text-[10px] text-[#8fa198]">PUBLISHED 12 SEP · 14:32</span><span className="mono text-[10px] text-[#8fa198]">ID FI-20260912-0042</span><span className="mono text-[10px] text-[#d8f36a]">STATUS PENDING</span></div></div></div>;
}

function YourSevenDays() {
  const steps = ["Join the Telegram feed", "Receive qualifying EPL intelligence before kickoff", "Review the probability, price and risk context", "Results are settled and recorded", "Inspect the complete historical record", "Decide whether the intelligence is worth continuing"];
  return <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{steps.map((step, index) => <div key={step} className="rounded-xl border border-white/[.11] bg-white/[.025] p-5"><span className="mono text-[10px] text-[#d8f36a]">{String(index + 1).padStart(2, "0")}</span><p className="mt-4 text-sm leading-6 text-[#c4d1c7]">{step}</p></div>)}</div>;
}

function PricingCard({ variant }: { variant: PricingVariant }) {
  return <div className="relative overflow-hidden rounded-2xl border border-[#d8f36a]/30 bg-[#17231b] p-6 shadow-[0_22px_70px_rgba(0,0,0,.22)] sm:p-8"><div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#d8f36a]/[.08] blur-3xl" /><div className="relative"><div className="flex items-start justify-between gap-5"><div><p className="eyebrow text-[#aabd8c]">YOUR VALIDATION COHORT</p><p className="display mt-3 text-5xl font-semibold tracking-[-.07em] text-[#eff8e2]">{formatNaira(variant)}</p><p className="mt-2 text-sm text-[#b1c1a9]">7-day trial · No automatic renewal</p></div><span className="rounded-full border border-[#d8f36a]/25 px-3 py-1.5 mono text-[10px] text-[#d8f36a]">VARIANT {variant}</span></div><div className="my-7 h-px bg-[#d8f36a]/15" /><ul className="grid gap-3 sm:grid-cols-2">{["1–3 qualifying EPL predictions per day", "Over/Under 2.5 and BTTS markets", "Model probability + market odds", "Estimated edge + confidence", "Risk flags + evidence-based rationale", "Prediction timestamp + result tracking", "Access to the public historical ledger", "Delivery through Telegram"].map((item) => <li key={item} className="flex items-start gap-2 text-[13px] text-[#c5d2c5]"><Check size={15} className="mt-0.5 shrink-0 text-[#d8f36a]" />{item}</li>)}</ul><Link href="/trial" onClick={() => { track("checkout_started", { pricing_variant: variant, amount: formatNaira(variant) }); track("trial_cta_clicked", { source: "pricing" }); }} className="btn btn-primary mt-8 w-full">Continue to trial <ArrowRight size={16} /></Link><p className="mt-3 text-center text-[11px] leading-5 text-[#879989]">Informational intelligence only. No guaranteed outcomes. Before accepting real payments, complete legal and payment-provider review.</p></div></div>;
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return <div className="mt-10 divide-y divide-white/[.1] rounded-2xl border border-white/[.11] bg-white/[.02]">{faqs.map(([question, answer], index) => <div key={question}><button className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-7" onClick={() => { setOpen(open === index ? -1 : index); track("faq_opened", { question }); }} aria-expanded={open === index}><span className="text-sm font-semibold text-[#dfe9e1]">{question}</span><ChevronDown size={17} className={`shrink-0 text-[#d8f36a] transition-transform ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <div className="px-5 pb-5 text-[13px] leading-6 text-[#96a89e] sm:px-7 sm:pb-6">{answer}</div>}</div>)}</div>;
}

function Footer() {
  return <footer className="border-t border-white/[.09] bg-[#050d0b] py-10"><div className="container"><div className="flex flex-col justify-between gap-8 md:flex-row"><div><Logo /><p className="mt-4 max-w-xs text-[12px] leading-5 text-[#74867b]">Decision intelligence for people who want to inspect the record before they act.</p></div><div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[12px] text-[#82938a] sm:grid-cols-4"><Link href="/ledger" className="hover:text-[#d8f36a]">Ledger</Link><Link href="/methodology" className="hover:text-[#d8f36a]">Methodology</Link><Link href="/responsible-use" className="hover:text-[#d8f36a]">Responsible use</Link><Link href="/trial" className="hover:text-[#d8f36a]">Start trial</Link><Link href="/terms" className="hover:text-[#d8f36a]">Terms</Link><Link href="/privacy" className="hover:text-[#d8f36a]">Privacy</Link></div></div><div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/[.08] pt-5 text-[11px] text-[#64776c] sm:flex-row"><span>© 2026 Football Intelligence. V.I.B.E.S. Validation Sprint 001.</span><span>18+ · Informational analysis only · Use responsibly.</span></div></div></footer>;
}

export default function Home() {
  const variant = usePricingVariant();
  useEffect(() => track("page_view", { page: "home" }), []);
  return <div className="noise min-h-screen overflow-hidden bg-[#07110f]"><Nav /><main>
    <section className="relative border-b border-white/[.08] pb-20 pt-14 sm:pb-28 sm:pt-20"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(216,243,106,.09),transparent_31%),radial-gradient(circle_at_12%_18%,rgba(67,117,87,.12),transparent_26%)]" /><div className="container grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-12"><div className="max-w-xl"><div className="reveal inline-flex items-center gap-2 rounded-full border border-[#d8f36a]/20 bg-[#d8f36a]/[.06] px-3 py-2"><span className="h-1.5 w-1.5 rounded-full bg-[#d8f36a]" /><span className="eyebrow text-[#d8f36a]">FOOTBALL INTELLIGENCE</span></div><h1 className="display reveal reveal-delay-1 mt-7 text-balance text-[clamp(3.1rem,7vw,6.3rem)] font-semibold leading-[.89] text-[#eef6ef]">Know which football predictions <span className="text-[#d8f36a]">deserve your trust.</span></h1><p className="reveal reveal-delay-2 mt-7 max-w-lg text-base leading-7 text-[#a3b2aa] sm:text-[17px]">Get transparent EPL probabilities, odds analysis and a complete prediction record before you make your decision.</p><div className="reveal reveal-delay-2 mt-6 flex flex-wrap gap-2"><TrustPill tone="accent"><Clock3 size={13} /> Every prediction timestamped.</TrustPill><TrustPill><FileCheck2 size={13} /> Every loss recorded.</TrustPill><TrustPill><LockKeyhole size={13} /> Nothing deleted.</TrustPill></div><div className="reveal reveal-delay-3 mt-8"><CTAButtons source="hero" /><p className="mt-4 text-[11px] text-[#74877b]">18+ · Informational intelligence only · No guaranteed outcomes</p></div></div><ProductInterface /></div></section>
    <section className="border-b border-white/[.08] bg-[#0b1713] py-16 sm:py-24"><div className="container grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-center"><div><SectionIntro label="01 / TRUST HOOK" title="Don't take our word for it. Check the record." copy="Most prediction services show you what they got right. We want you to see the complete record — timestamped before kickoff, with losses kept visible afterward." /><a href="#ledger" onClick={() => track("ledger_viewed", { source: "trust_hook" })} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#d8f36a] hover:gap-3">Inspect the ledger <ArrowRight size={16} /></a></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-white/[.1] bg-white/[.025] p-5"><p className="display text-4xl font-semibold text-[#d8f36a]">01</p><p className="mt-5 text-sm font-semibold text-[#dfe9e1]">Before kickoff</p><p className="mt-2 text-[12px] leading-5 text-[#86988e]">A timestamp anchors every prediction to the moment it was published.</p></div><div className="rounded-xl border border-white/[.1] bg-white/[.025] p-5"><p className="display text-4xl font-semibold text-[#d8f36a]">∞</p><p className="mt-5 text-sm font-semibold text-[#dfe9e1]">No clean-up</p><p className="mt-2 text-[12px] leading-5 text-[#86988e]">The historical record stays visible, including when a signal loses.</p></div><div className="rounded-xl border border-white/[.1] bg-white/[.025] p-5"><p className="display text-4xl font-semibold text-[#d8f36a]">0</p><p className="mt-5 text-sm font-semibold text-[#dfe9e1]">Forced picks</p><p className="mt-2 text-[12px] leading-5 text-[#86988e]">If evidence does not qualify, the system can say NO BET.</p></div></div></div></section>
    <section id="ledger" className="scroll-mt-24 border-b border-white/[.08] py-16 sm:py-24"><div className="container"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><SectionIntro label="02 / PUBLIC RECORD" title="The record is the product." copy="Sample records are shown below until validated live data is connected. The losing record stays in view by design." /><Link href="/ledger" onClick={() => track("ledger_viewed", { source: "ledger_section" })} className="btn btn-ghost shrink-0">View full prediction ledger <ExternalLink size={15} /></Link></div><div className="mt-10"><LedgerTable /></div><div className="mt-4 flex items-start gap-2 text-[12px] leading-5 text-[#8fa198]"><Info size={15} className="mt-0.5 shrink-0 text-[#d8f36a]" /><span><strong className="font-medium text-[#b9c9be]">Losses are part of the record.</strong> They are never removed to make the numbers look better.</span></div></div></section>
    <section className="border-b border-white/[.08] bg-[#0b1713] py-16 sm:py-24"><div className="container"><SectionIntro label="03 / METHODOLOGY" title="From data to decision intelligence." copy="A small, auditable loop turns raw information into a signal you can inspect." /><HowItWorks /></div></section>
    <section className="border-b border-white/[.08] py-16 sm:py-24"><div className="container grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-start"><div><SectionIntro label="04 / INTELLIGENCE CARD" title="More than a pick." copy="Every prediction comes with context. See the probability, check the price, audit the rationale." /><div className="mt-7 flex flex-wrap gap-2"><TrustPill tone="accent"><Scale size={13} /> Probability over certainty</TrustPill><TrustPill><GitBranch size={13} /> Evidence over hype</TrustPill></div></div><IntelligenceCard /></div></section>
    <section className="border-b border-white/[.08] bg-[#0b1713] py-16 sm:py-24"><div className="container grid gap-6 lg:grid-cols-[.75fr_1.25fr] lg:items-stretch"><div><SectionIntro label="05 / NO-BET SIGNAL" title="Sometimes the right prediction is no prediction." copy="If the available evidence does not meet the predefined qualification criteria, we don't force a pick. NO BET is a valid result." /></div><NoBetCard /></div></section>
    <section className="border-b border-white/[.08] py-16 sm:py-24"><div className="container"><SectionIntro label="06 / DIFFERENT BY DESIGN" title="Built around evidence, not hype." /><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["NO GUARANTEED WINS", "Football outcomes remain uncertain.", Sparkles], ["NO DELETED LOSSES", "Historical results remain visible.", ClipboardList], ["NO RETROACTIVE PICKS", "Predictions are recorded before kickoff.", Clock3], ["NO FAKE SCREENSHOTS", "The system is built around a structured record.", FileCheck2], ["NO FORCED PICKS", "When criteria are not met, the system can say NO BET.", OctagonAlert]].map(([title, copy, Icon]) => <div key={title as string} className="rounded-xl border border-white/[.11] p-5"><Icon size={18} className="text-[#d8f36a]" /><p className="mt-8 text-[11px] font-bold tracking-[.08em] text-[#e2ece3]">{title as string}</p><p className="mt-3 text-[12px] leading-5 text-[#87998e]">{copy as string}</p></div>)}</div></div></section>
    <section className="border-b border-white/[.08] bg-[#0b1713] py-16 sm:py-24"><div className="container"><SectionIntro label="07 / TELEGRAM DELIVERY" title="What arrives in your Telegram." copy="A concise, structured intelligence card — not a screenshot, not a guarantee. Sample data is shown for interface demonstration only." /><div className="mt-10"><TelegramCard /></div><p className="mt-4 text-[12px] text-[#8fa198]">1–3 qualifying signals per day. If nothing meets the criteria, we say NO BET.</p></div></section>
    <section className="border-b border-white/[.08] py-16 sm:py-24"><div className="container"><SectionIntro label="08 / YOUR 7 DAYS" title="A short trial. A complete record." copy="The point is to evaluate the intelligence in context, then decide whether it is worth continuing." /><YourSevenDays /></div></section>
    <section id="trial" className="scroll-mt-24 border-b border-white/[.08] bg-[#0b1713] py-16 sm:py-24"><div className="container grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><div><SectionIntro label="09 / VALIDATION TRIAL" title="Try the intelligence for 7 days." copy="Get direct access to the daily Football Intelligence feed through Telegram and see how the system performs in real time." /><p className="mt-5 rounded-lg border border-[#d8f36a]/15 bg-[#d8f36a]/[.04] p-4 text-[13px] leading-6 text-[#c2d0c4]">Football Intelligence is a 7-day Telegram service delivering pre-match EPL probabilities, odds context and risk information, backed by a public prediction record.</p><p className="mt-4 text-[12px] leading-5 text-[#7f9287]">A/B pricing is assigned once and preserved for the duration of the experiment. No auto-renewal.</p></div><PricingCard variant={variant} /></div></section>
    <section className="border-b border-white/[.08] py-16 sm:py-24"><div className="container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><SectionIntro label="08 / DECIDE WITH CONTEXT" title="See the record. Then decide." copy="You don't have to trust us blindly. Inspect the record first." /><div className="mt-7"><CTAButtons source="closing_cta" /></div></div><div className="surface rounded-2xl p-6 sm:p-8"><div className="flex items-center gap-3"><span className="rounded-lg bg-[#d8f36a]/10 p-2.5 text-[#d8f36a]"><Zap size={18} /></span><div><p className="text-sm font-semibold text-[#e6eee8]">Proof is free. Intelligence is paid.</p><p className="mt-1 text-[12px] text-[#84978c]">See the probability. Check the price. Audit the record.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-white/[.03] p-4"><p className="mono text-[10px] text-[#d8f36a]">01</p><p className="mt-3 text-[12px] font-semibold text-[#dbe6dd]">Inspect</p></div><div className="rounded-lg bg-white/[.03] p-4"><p className="mono text-[10px] text-[#d8f36a]">02</p><p className="mt-3 text-[12px] font-semibold text-[#dbe6dd]">Evaluate</p></div><div className="rounded-lg bg-white/[.03] p-4"><p className="mono text-[10px] text-[#d8f36a]">03</p><p className="mt-3 text-[12px] font-semibold text-[#dbe6dd]">Decide</p></div></div></div></div></section>
    <section className="border-b border-white/[.08] bg-[#18231c] py-14"><div className="container"><div className="flex items-start gap-4"><ShieldCheck className="mt-1 shrink-0 text-[#d8f36a]" size={22} /><div><p className="display text-2xl font-semibold text-[#eff7ef]">For adults. For information. Use responsibly.</p><p className="mt-3 max-w-3xl text-[13px] leading-6 text-[#adbbb0]">Football Intelligence provides informational analysis. It does not guarantee outcomes, profits or winnings and does not place bets or handle betting funds. <span className="font-semibold text-[#d8f36a]">18+ only.</span> Never bet money you cannot afford to lose. If betting is causing financial, emotional or behavioural problems, do not use this service.</p><Link href="/responsible-use" onClick={() => track("responsible_use_viewed", { source: "home" })} className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-[#d8f36a]">Read responsible use guidance <ArrowRight size={14} /></Link></div></div></div></section>
    <section className="py-16 sm:py-24"><div className="container max-w-4xl"><SectionIntro label="09 / FAQ" title="Questions worth asking." align="center" /><FAQ /></div></section>
  </main><Footer /><div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[.1] bg-[#07110f]/92 p-3 backdrop-blur-xl sm:hidden"><Link href="/trial" onClick={() => track("trial_cta_clicked", { source: "sticky_mobile" })} className="btn btn-primary w-full">Start the 7-day trial <ArrowUpRight size={16} /></Link></div></div>;
}

function PageFrame({ children, eyebrow, title, copy }: { children: React.ReactNode; eyebrow: string; title: string; copy: string }) {
  return <div className="noise min-h-screen bg-[#07110f]"><Nav /><main><section className="border-b border-white/[.08] bg-[radial-gradient(circle_at_80%_10%,rgba(216,243,106,.08),transparent_30%)] py-16 sm:py-24"><div className="container"><p className="section-label">{eyebrow}</p><h1 className="display mt-5 max-w-4xl text-balance text-5xl font-semibold leading-[.92] text-[#eff7ef] sm:text-7xl">{title}</h1><p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#9eafa5]">{copy}</p></div></section>{children}</main><Footer /></div>;
}

export function LedgerPage() {
  useEffect(() => track("page_view", { page: "ledger" }), []);
  return <PageFrame eyebrow="PUBLIC RECORD / LEDGER" title="A prediction record you can audit." copy="This is the public-facing ledger preview for the validation sprint. Demonstration data is clearly labeled until live validated records are connected."><section className="py-12 sm:py-20"><div className="container"><LedgerTable full /><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="surface rounded-xl p-5"><p className="eyebrow text-[#708379]">RECORD RULE</p><p className="mt-3 text-sm leading-6 text-[#bbc9bf]">Every prediction is timestamped before kickoff.</p></div><div className="surface rounded-xl p-5"><p className="eyebrow text-[#708379]">LOSS RULE</p><p className="mt-3 text-sm leading-6 text-[#bbc9bf]">A loss remains visible. No historical clean-up.</p></div><div className="surface rounded-xl p-5"><p className="eyebrow text-[#708379]">NO-BET RULE</p><p className="mt-3 text-sm leading-6 text-[#bbc9bf]">No qualifying signal is recorded as NO BET.</p></div></div><div className="mt-10 rounded-2xl border border-[#d8f36a]/15 bg-[#d8f36a]/[.04] p-6"><div className="flex items-start gap-3"><Info className="mt-0.5 shrink-0 text-[#d8f36a]" size={18} /><p className="text-sm leading-6 text-[#b9c9bd]">This preview is a product demonstration, not a statement of current performance. Do not interpret sample records as a historical accuracy claim.</p></div></div></div></section></PageFrame>;
}

export function MethodologyPage() {
  useEffect(() => track("page_view", { page: "methodology" }), []);
  return <PageFrame eyebrow="METHODOLOGY / THE LOOP" title="A signal is only useful when its reasoning is inspectable." copy="Football Intelligence combines statistical analysis with human review. The goal is not to create more picks; it is to surface the few signals that meet a defined qualification standard."><section className="py-12 sm:py-20"><div className="container"><HowItWorks /><div className="mt-14 grid gap-4 md:grid-cols-3"><div className="surface rounded-2xl p-6"><Gauge className="text-[#d8f36a]" size={21} /><h2 className="display mt-8 text-xl font-semibold">Probability</h2><p className="mt-3 text-sm leading-6 text-[#91a398]">A model output expresses uncertainty as a probability, never as a guarantee.</p></div><div className="surface rounded-2xl p-6"><Scale className="text-[#d8f36a]" size={21} /><h2 className="display mt-8 text-xl font-semibold">Price</h2><p className="mt-3 text-sm leading-6 text-[#91a398]">Market odds are shown beside model probability so the context can be checked.</p></div><div className="surface rounded-2xl p-6"><ShieldCheck className="text-[#d8f36a]" size={21} /><h2 className="display mt-8 text-xl font-semibold">Review</h2><p className="mt-3 text-sm leading-6 text-[#91a398]">Human review checks the record for relevant context before anything is published.</p></div></div></div></section></PageFrame>;
}

export function ResponsibleUsePage() {
  useEffect(() => track("page_view", { page: "responsible_use" }), []);
  return <PageFrame eyebrow="RESPONSIBLE USE / 18+" title="Use information responsibly." copy="Football Intelligence exists to help adults evaluate information. It is not a sportsbook, a wallet, a guarantee or a way to recover losses."><section className="py-12 sm:py-20"><div className="container grid gap-4 md:grid-cols-2"><div className="surface rounded-2xl p-7"><ShieldCheck className="text-[#d8f36a]" size={23} /><h2 className="display mt-8 text-2xl font-semibold">What this service does</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-[#a5b5ab]"><li className="flex gap-2"><Check className="mt-1 shrink-0 text-[#d8f36a]" size={15} />Provides statistical probabilities and odds context.</li><li className="flex gap-2"><Check className="mt-1 shrink-0 text-[#d8f36a]" size={15} />Maintains a visible record, including losses.</li><li className="flex gap-2"><Check className="mt-1 shrink-0 text-[#d8f36a]" size={15} />Delivers informational analysis through Telegram.</li></ul></div><div className="rounded-2xl border border-[#ff8888]/20 bg-[#ff8888]/[.05] p-7"><CircleAlert className="text-[#ff9d9d]" size={23} /><h2 className="display mt-8 text-2xl font-semibold">What this service does not do</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-[#c9b7b7]"><li className="flex gap-2"><X className="mt-1 shrink-0 text-[#ff9d9d]" size={15} />Guarantee outcomes, profit or winnings.</li><li className="flex gap-2"><X className="mt-1 shrink-0 text-[#ff9d9d]" size={15} />Place bets or accept betting funds.</li><li className="flex gap-2"><X className="mt-1 shrink-0 text-[#ff9d9d]" size={15} />Provide fixed matches, sure odds or banker picks.</li></ul></div><div className="md:col-span-2 rounded-2xl border border-white/[.11] p-7"><h2 className="display text-2xl font-semibold">A simple rule</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#a7b6ad]">Never bet money you cannot afford to lose. If betting is causing financial, emotional or behavioural problems, do not use this service and consider seeking support from a qualified professional or a relevant local service.</p></div></div></section></PageFrame>;
}

export function TrialPage() {
  const variant = usePricingVariant();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", source: getAcquisitionSource() });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const valid = form.name.trim().length > 1 && form.contact.trim().length > 3;
  useEffect(() => track("page_view", { page: "trial", pricing_variant: variant, assigned_price: formatNaira(variant), acquisition_source: getAcquisitionSource() }), [variant]);
  return <PageFrame eyebrow="7-DAY TRIAL / TELEGRAM" title="Try the intelligence. Keep the price you were assigned." copy="This validation sprint tests whether transparent football intelligence is useful enough to pay for. There is no auto-renewal, and no promise of outcomes."><section className="py-12 sm:py-20"><div className="container grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start"><div className="surface rounded-2xl p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[#8ea394]">YOUR COHORT</p><p className="display mt-3 text-5xl font-semibold text-[#d8f36a]">{formatNaira(variant)}</p><p className="mt-2 text-sm text-[#a1b0a6]">7-day trial · No automatic renewal</p></div><span className="rounded-full border border-[#d8f36a]/25 px-3 py-1.5 mono text-[10px] text-[#d8f36a]">VARIANT {variant}</span></div><div className="my-7 h-px bg-white/[.1]" /><ul className="space-y-3">{["Daily EPL intelligence through Telegram", "Over/Under 2.5 and BTTS markets", "Model probability, market odds and estimated edge", "Confidence, risk flags and rationale", "Timestamped results in the public ledger"].map((item) => <li key={item} className="flex gap-2 text-sm text-[#b9c8be]"><Check size={16} className="mt-0.5 shrink-0 text-[#d8f36a]" />{item}</li>)}</ul></div><div className="surface rounded-2xl p-6 sm:p-8"><p className="section-label">QUALIFIED SIGNUP</p><h2 className="display mt-4 text-3xl font-semibold">Tell us where to send the invite.</h2>{submitted ? <div className="mt-8 rounded-xl border border-[#d8f36a]/20 bg-[#d8f36a]/[.06] p-5"><CircleCheck className="text-[#d8f36a]" size={24} /><p className="mt-4 text-base font-semibold text-[#e6f0e7]">Request recorded for the validation sprint.</p><p className="mt-2 text-sm leading-6 text-[#9fb0a5]">Your signup is captured with cohort {variant} at {formatNaira(variant)}. Payment and Telegram activation remain the next integration steps; no payment has been processed in this static validation build.</p><div className="mt-5 rounded-lg border border-[#f3c978]/20 bg-[#f3c978]/[.05] p-4 text-[12px] leading-5 text-[#cdbf9f]">Owner action required: connect a reviewed payment provider, then record payment reference, payment status, amount and purchase timestamp before enabling live checkout.</div></div> : <form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); if (!valid) return; const prospectId = window.localStorage.getItem("fi_prospect_id") ?? `prospect-${Date.now()}`; window.localStorage.setItem("fi_prospect_id", prospectId); window.localStorage.setItem("fi_signup", JSON.stringify({ prospect_id: prospectId, name: form.name, contact: form.contact, acquisition_source: form.source, pricing_variant: variant, assigned_price: formatNaira(variant), assigned_at: window.localStorage.getItem("fi_pricing_assigned_at") ?? new Date().toISOString(), payment_status: "pending", payment_amount: formatNaira(variant), payment_reference: "", purchased_at: "" })); track("checkout_started", { prospect_id: prospectId, pricing_variant: variant, assigned_price: formatNaira(variant), acquisition_source: form.source }); setSubmitted(true); }}><label className="block"><span className="eyebrow text-[#778a7f]">NAME</span><input value={form.name} onChange={(e) => update("name", e.target.value)} required className="mt-2 w-full rounded-lg border border-white/[.13] bg-white/[.035] px-4 py-3 text-sm text-[#eff7ef] placeholder:text-[#617369]" placeholder="Your name" /></label><label className="block"><span className="eyebrow text-[#778a7f]">TELEGRAM OR WHATSAPP CONTACT</span><input value={form.contact} onChange={(e) => update("contact", e.target.value)} required className="mt-2 w-full rounded-lg border border-white/[.13] bg-white/[.035] px-4 py-3 text-sm text-[#eff7ef] placeholder:text-[#617369]" placeholder="@handle or phone number" /></label><label className="block"><span className="eyebrow text-[#778a7f]">HOW DID YOU FIND US?</span><select value={form.source} onChange={(e) => update("source", e.target.value)} className="mt-2 w-full rounded-lg border border-white/[.13] bg-[#0d1916] px-4 py-3 text-sm text-[#eff7ef]"><option value="direct">Direct</option><option value="telegram">Telegram</option><option value="whatsapp">WhatsApp</option><option value="referral">Referral</option><option value="community">Independent community</option></select></label><button type="submit" disabled={!valid} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40">Continue with {formatNaira(variant)} <ArrowRight size={16} /></button><p className="text-center text-[11px] leading-5 text-[#73867a]">Demo flow only. Before accepting real payments, connect a reviewed payment provider and publish final terms/refund policy.</p></form>}</div></div></section></PageFrame>;
}

export function LegalPage({ title, eyebrow }: { title: string; eyebrow: string }) {
  return <PageFrame eyebrow={eyebrow} title={title} copy="This page is a placeholder for the final policy text to be reviewed and published before the validation experiment accepts real payments."><section className="py-12 sm:py-20"><div className="container max-w-3xl"><div className="surface rounded-2xl p-7 sm:p-10"><p className="text-sm leading-7 text-[#a6b6ac]">Final content should cover the service scope, informational nature of the product, user responsibilities, data handling, payment/refund terms and contact details. This placeholder is intentionally explicit so visitors are not shown incomplete policy language as if it were final.</p><div className="mt-8 rounded-xl border border-[#f3c978]/20 bg-[#f3c978]/[.05] p-5 text-sm leading-6 text-[#cdbf9f]"><strong className="text-[#f3c978]">Owner action required:</strong> complete legal and payment-provider review before accepting real payments.</div></div></div></section></PageFrame>;
}
