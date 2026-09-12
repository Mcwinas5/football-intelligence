import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createPrediction, correctPrediction, createProspect, findProspect, metrics, mockPayment, mockTelegramActivation, recordEvent, settlePrediction, startCheckout, store, visiblePredictions } from "./validation";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const adminToken = process.env.ADMIN_TOKEN || "dev-admin-token";
const app = express();
app.use(express.json());

function adminOnly(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.header("x-admin-token") !== adminToken) return res.status(401).json({ error: "Admin authentication required" });
  next();
}
function ok(res: express.Response, fn: () => unknown) { try { return res.json(fn()); } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Request failed" }); } }

app.get("/api/validation/mode", (_req, res) => res.json({ mode: "non-live-mock", payment_live: false, telegram_live: false, supabase_connected: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) }));
app.post("/api/validation/prospects", (req, res) => ok(res, () => createProspect({ name: String(req.body.name ?? ""), email: req.body.email ? String(req.body.email) : undefined, phone_or_telegram: String(req.body.phone_or_telegram ?? ""), acquisition_source: req.body.acquisition_source }))); 
app.post("/api/validation/checkout", (req, res) => ok(res, () => startCheckout(String(req.body.prospect_id))));
app.post("/api/validation/mock/payment", (req, res) => ok(res, () => mockPayment(String(req.body.prospect_id), req.body.success !== false)));
app.post("/api/validation/mock/telegram", (req, res) => ok(res, () => mockTelegramActivation(String(req.body.prospect_id), String(req.body.telegram_identifier))));
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
createServer(app).listen(port, () => console.log(`Server running on http://localhost:${port}/ (non-live validation mode)`));
