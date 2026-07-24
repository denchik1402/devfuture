import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeHtml } from "../telegram";
import {
  extractTelegramUsername,
  isValidContactBody,
} from "../contact-validation";
import { rateLimit } from "../rate-limit";

describe("escapeHtml", () => {
  it("escapes &, <, >", () => {
    assert.equal(escapeHtml(`a & b <c> "d"`), `a &amp; b &lt;c&gt; "d"`);
  });
});

describe("isValidContactBody", () => {
  it("requires name, contact, type and message >= 10 chars", () => {
    assert.equal(
      isValidContactBody({
        name: "Иван",
        contact: "@ivanov",
        type: "Бот",
        message: "Нужен простой бот",
      }),
      true
    );
    assert.equal(
      isValidContactBody({
        name: "Иван",
        contact: "@ivanov",
        type: "Бот",
        message: "коротко",
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
