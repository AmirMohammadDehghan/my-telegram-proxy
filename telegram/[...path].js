export default async function handler(req, res) {
  const parts = req.query.path || [];
  const telegramPath = "/" + parts.join("/");

  let body = req.body;

  // n8n sends JSON to Telegram
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  // Intercept setWebhook
  if (telegramPath.endsWith("/setWebhook") && body?.url) {
    const originalUrl = new URL(body.url);

    body.url =
      "https://my-telegram-proxy-five.vercel.app/tg-webhook" +
      originalUrl.pathname +
      originalUrl.search;
  }

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers["content-length"];

  const response = await fetch(
    `https://api.telegram.org${telegramPath}`,
    {
      method: req.method,
      headers,
      body:
        ["GET", "HEAD"].includes(req.method)
          ? undefined
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    }
  );

  res.status(response.status);

  for (const [key, value] of response.headers.entries()) {
    if (
      !["connection", "transfer-encoding"].includes(key.toLowerCase())
    ) {
      res.setHeader(key, value);
    }
  }

  res.send(Buffer.from(await response.arrayBuffer()));
}
