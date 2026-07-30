export type ContactBody = {
  name?: string;
  contact?: string;
  type?: string;
  message?: string;
  company?: string;
  /** e.g. telegram_mini_app|utm:yandex */
  source?: string;
  /** User accepted privacy policy */
  consent?: boolean;
  /** Telegram WebApp initData for Mini App posts */
  initData?: string;
};

export function isValidContactBody(
  body: ContactBody
): body is Required<
  Pick<ContactBody, "name" | "contact" | "type" | "message">
> &
  ContactBody {
  return Boolean(
    body.name?.trim() &&
      body.contact?.trim() &&
      body.type?.trim() &&
      body.message?.trim() &&
      body.message.trim().length >= 10 &&
      body.consent === true
  );
}

export function extractTelegramUsername(contact: string): string | null {
  const trimmed = contact.trim();
  const at = trimmed.match(/^@([a-zA-Z0-9_]{5,32})$/);
  if (at) return at[1];
  const url = trimmed.match(
    /(?:t\.me\/|telegram\.me\/)([a-zA-Z0-9_]{5,32})/i
  );
  if (url) return url[1];
  return null;
}
