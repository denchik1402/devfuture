/**
 * IndexNow ping (Yandex endpoint).
 * Set INDEXNOW_KEY in env. Host the same key at /indexnow-key.txt
 * (or `public/{INDEXNOW_KEY}.txt` per IndexNow spec) — see OPS notes.
 */
export async function pingIndexNow(urls: string[]): Promise<boolean> {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || urls.length === 0) return false;

  const host = (() => {
    try {
      return new URL(urls[0]).host;
    } catch {
      return undefined;
    }
  })();

  if (!host) return false;

  const res = await fetch("https://yandex.com/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `https://${host}/indexnow-key.txt`,
      urlList: urls,
    }),
  });

  return res.ok || res.status === 202;
}
