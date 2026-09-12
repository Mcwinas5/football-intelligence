export type PaymentState = "pending" | "successful" | "failed" | "cancelled";

export interface PaymentSessionRequest {
  prospectId: string;
  amountNgn: number;
  reference: string;
  callbackUrl?: string;
}

export interface PaymentSession {
  provider: "mock" | "paystack";
  reference: string;
  amountNgn: number;
  status: PaymentState;
  checkoutUrl?: string;
}

export interface PaymentProvider {
  createSession(request: PaymentSessionRequest): Promise<PaymentSession>;
  verifyWebhook(payload: unknown, signature?: string): Promise<{ reference: string; amountNgn: number; status: PaymentState }>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createSession(request: PaymentSessionRequest) { return { provider: "mock" as const, reference: request.reference, amountNgn: request.amountNgn, status: "pending" as const }; }
  async verifyWebhook(payload: any) { return { reference: String(payload.reference ?? "MOCK"), amountNgn: Number(payload.amountNgn ?? 0), status: payload.status === "successful" ? "successful" as const : "failed" as const }; }
}

export interface TelegramActivationRequest { prospectId: string; telegramIdentifier: string; }
export interface TelegramGateway { createOnboardingLink(prospectId: string): Promise<string>; matchIdentity(request: TelegramActivationRequest): Promise<boolean>; }

export class MockTelegramGateway implements TelegramGateway {
  async createOnboardingLink(prospectId: string) { return `/api/validation/mock/telegram?prospect_id=${encodeURIComponent(prospectId)}`; }
  async matchIdentity(request: TelegramActivationRequest) { return Boolean(request.prospectId && request.telegramIdentifier); }
}

// Paystack and Telegram implementations intentionally remain unconfigured until credentials are supplied.
// Secret values must be read server-side from PAYSTACK_SECRET_KEY, PAYSTACK_WEBHOOK_SECRET, and TELEGRAM_BOT_TOKEN.
