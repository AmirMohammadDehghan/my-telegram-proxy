export default async function handler(req, res) {
  const parts = req.query.path || [];
  const path = "/" + parts.join("/");

  const target = `https://n8n.24u.ir${path}`;

  const headers = { ...req.headers };

  delete headers.host;
  delete headers.connection;
  delete headers["content-length"];

  const response = await fetch(target, {
    method: req.method,
    headers,
    body:
      ["GET", "HEAD"].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
  });

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
