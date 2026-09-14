import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createPrediction, correctPrediction, createProspect, findProspect, getPricingAssignment, metrics, mockPayment, mockTelegramActivation, recordEvent, settlePrediction, startCheckout, store, visiblePredictions } from "./validation";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";

// Fail closed: there is no default admin token. When ADMIN_TOKEN is missing the
// protected endpoints refuse to operate with an explicit error (see adminOnly).
const adminToken = process.env.ADMIN_TOKEN;
if (!adminToken) {
  console.warn("ADMIN_TOKEN is not configured — admin endpoints are DISABLED (fail closed). Set ADMIN_TOKEN to enable them.");
}
const app = express();
app.use(express.json());

function adminOnly(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!adminToken) return res.status(503).json({ error: "Admin endpoints unavailable: ADMIN_TOKEN is not configured (fail closed)" });
  if (req.header("x-admin-token") !== adminToken) return res.status(401).json({ error: "Admin authentication required" });
  next();
}
// Mock payment/Telegram endpoints exist only for the non-live validation sprint.
// They must never be publicly usable once production mode is enabled.
function mockOnly(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (isProduction) return res.status(404).json({ error: "Mock endpoints are disabled in production mode" });
  next();
}
function ok(res: express.Response, fn: () => unknown) { try { return res.json(fn()); } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Request failed" }); } }

app.get("/api/validation/mode", (_req, res) => res.json({ mode: "non-live-mock", payment_live: false, telegram_live: false, supabase_connected: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), admin_configured: Boolean(adminToken), mock_endpoints_enabled: !isProduction }));

// Server-authoritative pricing experiment assignment. The client calls this to obtain
// (or re-validate) its cohort; it never computes a variant locally. See AGENTS.md.
app.post("/api/validation/pricing-assignment", (req, res) => ok(res, () => ({ assignment: getPricingAssignment(typeof req.body.assignment_id === "string" ? req.body.assignment_id : undefined) })));
app.post("/api/validation/prospects", (req, res) => ok(res, () => createProspect({ name: String(req.body.name ?? ""), email: req.body.email ? String(req.body.email) : undefined, phone_or_telegram: String(req.body.phone_or_telegram ?? ""), acquisition_source: req.body.acquisition_source, assignment_id: typeof req.body.assignment_id === "string" ? req.body.assignment_id : undefined }))); 
app.post("/api/validation/checkout", (req, res) => ok(res, () => startCheckout(String(req.body.prospect_id))));
app.post("/api/validation/mock/payment", mockOnly, (req, res) => ok(res, () => mockPayment(String(req.body.prospect_id), req.body.success !== false)));
app.post("/api/validation/mock/telegram", mockOnly, (req, res) => ok(res, () => mockTelegramActivation(String(req.body.prospect_id), String(req.body.telegram_identifier))));
app.post("/api/validation/events", (req, res) => ok(res, () => recordEvent(req.body.event_name, req.body.prospect_id, req.body.event_properties ?? {})));
app.get("/api/validation/state/:prospectId", (req, res) => ok(res, () => ({ prospect: findProspect(req.params.prospectId), assignment: store.pricingAssignments.find((item) => item.prospect_id === req.params.prospectId), purchases: store.trialPurchases.filter((item) => item.prospect_id === req.params.prospectId), telegram: store.telegramActivations.filter((item) => item.prospect_id === req.params.prospectId), events: store.analyticsEvents.filter((item) => item.prospect_id === req.params.prospectId) })));
app.get("/api/predictions", (req, res) => res.json({ mode: "server-filtered", access: req.query.access === "subscriber" ? "subscriber" : "public", records: visiblePredictions(req.query.access === "subscriber" ? "subscriber" : "public") }));
app.get("/api/admin/metrics", adminOnly, (_req, res) => res.json(metrics()));
app.get("/api/admin/predictions", adminOnly, (_req, res) => res.json({ predictions: store.predictions, corrections: store.corrections }));
app.post("/api/admin/predictions", adminOnly, (req, res) => ok(res, () => createPrediction(req.body)));
app.post("/api/admin/predictions/:id/settle", adminOnly, (req, res) => ok(res, () => settlePrediction(req.params.id, req.body.result)));
app.post("/api/admin/predictions/:id/correct", adminOnly, (req, res) => ok(res, () => correctPrediction(req.params.id, req.body.corrected_value, String(req.body.reason), String(req.body.corrected_by))));

const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
app.use(express.static(staticPath));
app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));

const port = process.env.PORT || 3000;
createServer(app).listen(port, () => console.log(`Server running on http://localhost:${port}/ (non-live validation mode, mock endpoints ${isProduction ? "disabled" : "enabled"})`));
