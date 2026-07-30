import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeHtml } from "../telegram";
import {
  extractTelegramUsername,
  isValidContactBody,
} from "../contact-validation";
import { rateLimit } from "../rate-limit";
import { isAdmin, getAdminIds } from "../bot-admin";
import { parseStartPayload } from "../bot-content";

describe("escapeHtml", () => {
  it("escapes &, <, >", () => {
    assert.equal(escapeHtml(`a & b <c> "d"`), `a &amp; b &lt;c&gt; "d"`);
  });
});

describe("isValidContactBody", () => {
  it("requires name, contact, type, message >= 10 and consent", () => {
    assert.equal(
      isValidContactBody({
        name: "Иван",
        contact: "@ivanov",
        type: "Бот",
        message: "Нужен простой бот",
        consent: true,
      }),
      true
    );
    assert.equal(
      isValidContactBody({
        name: "Иван",
        contact: "@ivanov",
        type: "Бот",
        message: "Нужен простой бот",
      }),
      false
    );
    assert.equal(
      isValidContactBody({
        name: "Иван",
        contact: "@ivanov",
        type: "Бот",
        message: "коротко",
        consent: true,
      }),
      false
    );
    assert.equal(isValidContactBody({ name: "Иван" }), false);
  });
});

describe("extractTelegramUsername", () => {
  it("parses @user and t.me links", () => {
    assert.equal(extractTelegramUsername("@ivan_petrov"), "ivan_petrov");
    assert.equal(
      extractTelegramUsername("https://t.me/ivan_petrov"),
      "ivan_petrov"
    );
    assert.equal(extractTelegramUsername("+79991234567"), null);
  });
});

describe("rateLimit", () => {
  it("blocks after the limit within the window", () => {
    const key = `test-${Date.now()}`;
    assert.equal(rateLimit(key, 2, 60_000).ok, true);
    assert.equal(rateLimit(key, 2, 60_000).ok, true);
    const blocked = rateLimit(key, 2, 60_000);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.ok(blocked.retryAfterSec >= 1);
  });
});

describe("bot admin", () => {
  it("treats TELEGRAM_CHAT_ID and TELEGRAM_ADMIN_IDS as admins", () => {
    const prevChat = process.env.TELEGRAM_CHAT_ID;
    const prevAdmins = process.env.TELEGRAM_ADMIN_IDS;
    process.env.TELEGRAM_CHAT_ID = "111";
    process.env.TELEGRAM_ADMIN_IDS = "222, 333";
    try {
      assert.equal(isAdmin(111), true);
      assert.equal(isAdmin(222), true);
      assert.equal(isAdmin(333), true);
      assert.equal(isAdmin(999), false);
      assert.equal(isAdmin(undefined), false);
      assert.ok(getAdminIds().has(111));
    } finally {
      if (prevChat === undefined) delete process.env.TELEGRAM_CHAT_ID;
      else process.env.TELEGRAM_CHAT_ID = prevChat;
      if (prevAdmins === undefined) delete process.env.TELEGRAM_ADMIN_IDS;
      else process.env.TELEGRAM_ADMIN_IDS = prevAdmins;
    }
  });
});

describe("parseStartPayload", () => {
  it("parses deep-link payloads", () => {
    assert.deepEqual(parseStartPayload("/start"), { kind: "menu" });
    assert.deepEqual(parseStartPayload("/start order"), { kind: "order" });
    assert.deepEqual(parseStartPayload("/start faq"), { kind: "faq" });
    assert.deepEqual(parseStartPayload("/start pkg_bot"), {
      kind: "package",
      id: "bot",
    });
    assert.deepEqual(parseStartPayload("/start svc_telegram-boty"), {
      kind: "service",
      slug: "telegram-boty",
    });
    assert.deepEqual(parseStartPayload("/start demo_booking"), {
      kind: "demo",
      demo: "booking",
    });
    assert.deepEqual(parseStartPayload("/start lead_abc123"), {
      kind: "lead",
      id: "abc123",
    });
  });
});
