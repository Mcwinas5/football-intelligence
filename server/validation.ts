import { randomUUID } from "crypto";

export type Variant = "A" | "B";
export type PaymentStatus = "pending" | "successful" | "failed" | "cancelled";
export type ActivationStatus = "pending" | "activated" | "failed";
export type EventName = "page_view" | "hero_trial_clicked" | "ledger_viewed" | "ledger_prediction_opened" | "trial_clicked" | "pricing_variant_assigned" | "checkout_started" | "payment_completed" | "telegram_clicked" | "telegram_activated" | "faq_opened" | "responsible_use_viewed";

export interface Prospect { id: string; name: string; email?: string; phone_or_telegram: string; acquisition_source: string; created_at: string; }
export interface PricingAssignment { id: string; prospect_id: string; variant: Variant; assigned_price: number; assigned_at: string; }
export interface TrialPurchase { id: string; prospect_id: string; pricing_variant: Variant; assigned_price: number; payment_amount?: number; payment_reference?: string; payment_status: PaymentStatus; purchased_at?: string; created_at: string; }
export interface TelegramActivation { id: string; prospect_id: string; telegram_identifier?: string; activation_status: ActivationStatus; activated_at?: string; created_at: string; }
export interface AnalyticsEvent { id: string; prospect_id?: string; event_name: EventName; event_properties: Record<string, unknown>; created_at: string; }
export interface PredictionRecord { id: string; prediction_id: string; fixture_id?: string; competition: string; home_team: string; away_team: string; market: string; selection: string; model_probability: number; market_odds: number; odds_source: string; odds_timestamp: string; implied_probability?: number; estimated_edge?: number; confidence: string; risk_flags: string[]; model_version: string; data_version: string; publication_timestamp: string; kickoff_timestamp: string; subscriber_release_timestamp: string; public_release_timestamp: string; settlement_status: "pending" | "settled"; result?: "WON" | "LOST" | "NO BET"; settlement_timestamp?: string; created_at: string; }
export interface PredictionCorrection { id: string; prediction_id: string; original_value: unknown; corrected_value: unknown; reason: string; corrected_at: string; corrected_by: string; }

export const store = {
  prospects: [] as Prospect[],
  pricingAssignments: [] as PricingAssignment[],
  trialPurchases: [] as TrialPurchase[],
  telegramActivations: [] as TelegramActivation[],
  analyticsEvents: [] as AnalyticsEvent[],
  predictions: [] as PredictionRecord[],
  corrections: [] as PredictionCorrection[],
};

const sourceValues = new Set(["telegram", "whatsapp", "facebook", "referral", "community", "warm-network", "organic", "direct", "other"]);
const amountFor = (variant: Variant) => variant === "A" ? 1000 : 2000;
const now = () => new Date().toISOString();

export function normalizeSource(value: unknown) { return typeof value === "string" && sourceValues.has(value) ? value : "direct"; }
export function recordEvent(event_name: EventName, prospect_id: string | undefined, event_properties: Record<string, unknown> = {}) {
  const event = { id: randomUUID(), prospect_id, event_name, event_properties, created_at: now() };
  store.analyticsEvents.push(event);
  return event;
}
export function findProspect(id: string) { return store.prospects.find((item) => item.id === id); }
export function findAssignment(prospect_id: string) { return store.pricingAssignments.find((item) => item.prospect_id === prospect_id); }
export function assignPricing(prospect_id: string) {
  const existing = findAssignment(prospect_id);
  if (existing) return existing;
  const variant: Variant = Math.random() < 0.5 ? "A" : "B";
  const assignment = { id: randomUUID(), prospect_id, variant, assigned_price: amountFor(variant), assigned_at: now() };
  store.pricingAssignments.push(assignment);
  recordEvent("pricing_variant_assigned", prospect_id, { pricing_variant: variant, assigned_price: assignment.assigned_price });
  return assignment;
}
export function createProspect(input: { name: string; email?: string; phone_or_telegram: string; acquisition_source?: string }) {
  const prospect = { id: randomUUID(), name: input.name, email: input.email, phone_or_telegram: input.phone_or_telegram, acquisition_source: normalizeSource(input.acquisition_source), created_at: now() };
  store.prospects.push(prospect);
  const assignment = assignPricing(prospect.id);
  return { prospect, assignment };
}
export function startCheckout(prospect_id: string) {
  const prospect = findProspect(prospect_id);
  const assignment = findAssignment(prospect_id);
  if (!prospect || !assignment) throw new Error("Prospect or pricing assignment not found");
  const purchase = { id: randomUUID(), prospect_id, pricing_variant: assignment.variant, assigned_price: assignment.assigned_price, payment_status: "pending" as PaymentStatus, created_at: now() };
  store.trialPurchases.push(purchase);
  recordEvent("checkout_started", prospect_id, { pricing_variant: assignment.variant, assigned_price: assignment.assigned_price, acquisition_source: prospect.acquisition_source });
  return { purchase, amount: assignment.assigned_price, currency: "NGN", mode: "mock" as const };
}
export function mockPayment(prospect_id: string, success = true) {
  const prospect = findProspect(prospect_id);
  const assignment = findAssignment(prospect_id);
  const purchase = [...store.trialPurchases].reverse().find((item) => item.prospect_id === prospect_id && item.payment_status === "pending");
  if (!prospect || !assignment || !purchase) throw new Error("Pending checkout not found");
  purchase.payment_status = success ? "successful" : "failed";
  purchase.payment_amount = assignment.assigned_price;
  purchase.payment_reference = `MOCK-${randomUUID().slice(0, 8).toUpperCase()}`;
  purchase.purchased_at = success ? now() : undefined;
  if (success) recordEvent("payment_completed", prospect_id, { payment_amount: purchase.payment_amount, payment_reference: purchase.payment_reference, pricing_variant: assignment.variant, assigned_price: assignment.assigned_price, acquisition_source: prospect.acquisition_source, mock: true });
  return purchase;
}
export function mockTelegramActivation(prospect_id: string, telegram_identifier: string) {
  const purchase = [...store.trialPurchases].reverse().find((item) => item.prospect_id === prospect_id && item.payment_status === "successful");
  if (!purchase) throw new Error("Verified payment required before Telegram activation");
  const activation = { id: randomUUID(), prospect_id, telegram_identifier, activation_status: "activated" as ActivationStatus, activated_at: now(), created_at: now() };
  store.telegramActivations.push(activation);
  recordEvent("telegram_activated", prospect_id, { telegram_identifier, mock: true });
  return activation;
}
export function createPrediction(input: Omit<PredictionRecord, "id" | "prediction_id" | "publication_timestamp" | "subscriber_release_timestamp" | "public_release_timestamp" | "settlement_status" | "settlement_timestamp" | "created_at">) {
  const published = now();
  const prediction: PredictionRecord = { id: randomUUID(), prediction_id: `FI-${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12)}-${Math.floor(Math.random() * 9000 + 1000)}`, ...input, publication_timestamp: published, subscriber_release_timestamp: published, public_release_timestamp: new Date(Date.parse(published) + 3600000).toISOString(), settlement_status: "pending", created_at: published };
  store.predictions.push(prediction);
  return prediction;
}
export function visiblePredictions(access: "public" | "subscriber") {
  const time = Date.now();
  return store.predictions.filter((item) => access === "subscriber" ? time >= Date.parse(item.subscriber_release_timestamp) : time >= Date.parse(item.public_release_timestamp));
}
export function settlePrediction(id: string, result: "WON" | "LOST" | "NO BET") {
  const prediction = store.predictions.find((item) => item.id === id);
  if (!prediction) throw new Error("Prediction not found");
  prediction.result = result;
  prediction.settlement_status = "settled";
  prediction.settlement_timestamp = now();
  return prediction;
}
export function correctPrediction(id: string, corrected_value: unknown, reason: string, corrected_by: string) {
  const prediction = store.predictions.find((item) => item.id === id);
  if (!prediction) throw new Error("Prediction not found");
  const original_value = { ...prediction };
  const correction = { id: randomUUID(), prediction_id: id, original_value, corrected_value, reason, corrected_at: now(), corrected_by };
  store.corrections.push(correction);
  return correction;
}
export function metrics() {
  const successful = store.trialPurchases.filter((item) => item.payment_status === "successful");
  return { total_prospects: store.prospects.length, activated_prospects: store.telegramActivations.filter((item) => item.activation_status === "activated").length, cohort_a: store.pricingAssignments.filter((item) => item.variant === "A").length, cohort_b: store.pricingAssignments.filter((item) => item.variant === "B").length, purchases: successful.length, revenue: successful.reduce((sum, item) => sum + (item.payment_amount ?? 0), 0), payment_conversion: store.prospects.length ? successful.length / store.prospects.length : 0, telegram_activation_rate: successful.length ? store.telegramActivations.filter((item) => item.activation_status === "activated").length / successful.length : 0, total_predictions: store.predictions.length, settled_predictions: store.predictions.filter((item) => item.settlement_status === "settled").length, wins: store.predictions.filter((item) => item.result === "WON").length, losses: store.predictions.filter((item) => item.result === "LOST").length, no_bets: store.predictions.filter((item) => item.result === "NO BET").length, acquisition_sources: store.prospects.reduce<Record<string, number>>((out, item) => { out[item.acquisition_source] = (out[item.acquisition_source] ?? 0) + 1; return out; }, {}) };
}
