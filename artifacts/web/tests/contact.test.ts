import { afterEach, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";

import { POST } from "../app/api/contact/route.ts";
import {
  EmailNotConfiguredError,
  isEmailConfigured,
  sendContactEmail,
} from "../lib/email.ts";

const ENV_KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "GMAIL_CLIENT_ID",
  "GMAIL_CLIENT_SECRET",
  "GMAIL_REFRESH_TOKEN",
  "GMAIL_USER",
] as const;

const SYNTHETIC_LEAD = {
  name: "Synthetic Tester",
  phone: "555-0100",
  email: "synthetic.lead@example.test",
  service: "leak",
  message: "Synthetic message about a leaking roof. Not real customer data.",
};

const PII_VALUES = [
  SYNTHETIC_LEAD.name,
  SYNTHETIC_LEAD.phone,
  SYNTHETIC_LEAD.email,
  SYNTHETIC_LEAD.message,
];

const savedEnv = new Map<string, string | undefined>();
let capturedLogs: string[] = [];
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};
const originalCreateTransport = nodemailer.createTransport;

function clearEmailEnv(): void {
  for (const key of ENV_KEYS) delete process.env[key];
}

function restoreEmailEnv(): void {
  for (const key of ENV_KEYS) {
    const value = savedEnv.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function captureConsole(): void {
  capturedLogs = [];
  const collect = (...args: unknown[]) => {
    capturedLogs.push(
      args
        .map((arg) => {
          if (typeof arg === "string") return arg;
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(" "),
    );
  };
  console.log = collect;
  console.info = collect;
  console.warn = collect;
  console.error = collect;
}

function restoreConsole(): void {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
}

function assertNoPiiInLogs(): void {
  const combined = capturedLogs.join("\n");
  for (const value of PII_VALUES) {
    assert.ok(
      !combined.includes(value),
      `log output must not contain lead PII (found ${value})`,
    );
  }
}

function contactRequest(): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(SYNTHETIC_LEAD),
  });
}

beforeEach(() => {
  savedEnv.clear();
  for (const key of ENV_KEYS) savedEnv.set(key, process.env[key]);
  clearEmailEnv();
  captureConsole();
});

afterEach(() => {
  restoreConsole();
  restoreEmailEnv();
  nodemailer.createTransport = originalCreateTransport;
});

describe("contact form email configuration", () => {
  test("reports the not-configured state to the caller", async () => {
    assert.equal(isEmailConfigured(), false);

    await assert.rejects(
      sendContactEmail({
        to: ["owner@example.test"],
        subject: "Synthetic subject",
        text: "Synthetic body",
        html: "<p>Synthetic body</p>",
      }),
      (error: unknown) =>
        error instanceof EmailNotConfiguredError &&
        error.code === "EMAIL_NOT_CONFIGURED",
    );
  });
});

describe("POST /api/contact", () => {
  test("returns 500 and the call-us message when the transport is unconfigured", async () => {
    const response = await POST(contactRequest());

    assert.equal(response.status, 500);
    const body = (await response.json()) as { error?: string };
    assert.match(body.error ?? "", /call \(717\) 500-1434/);
    assertNoPiiInLogs();
  });

  test("returns 200 when a configured transport accepts the message", async () => {
    process.env.SMTP_HOST = "smtp.example.test";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "synthetic-sender";
    process.env.SMTP_PASS = "synthetic-password";
    assert.equal(isEmailConfigured(), true);

    const sent: Array<Record<string, unknown>> = [];
    nodemailer.createTransport = (() => ({
      sendMail: async (mail: Record<string, unknown>) => {
        sent.push(mail);
        return { messageId: "synthetic-test-id" };
      },
    })) as unknown as typeof nodemailer.createTransport;

    const response = await POST(contactRequest());

    assert.equal(response.status, 200);
    const body = (await response.json()) as { ok?: boolean };
    assert.equal(body.ok, true);

    assert.equal(sent.length, 1);
    const mail = sent[0];
    assert.equal(
      mail.to,
      "ddawson@reviveroofrepair.com, dcdawson22@gmail.com",
    );
    assert.match(String(mail.subject), /Synthetic Tester/);
    assert.match(String(mail.subject), /leak/);
    assert.equal(mail.replyTo, SYNTHETIC_LEAD.email);
    assertNoPiiInLogs();
  });
});
