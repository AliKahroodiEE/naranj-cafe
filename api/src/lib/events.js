// Live updates with Server-Sent Events (SSE).
// Every open menu page keeps one connection here; when the admin changes
// anything we broadcast an event and the page re-fetches the menu.

const clients = new Set();

export function subscribe(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // stop Nginx from buffering the stream
    'Access-Control-Allow-Origin': process.env.WEB_ORIGIN || '*',
  });
  res.flushHeaders();
  res.write('retry: 3000\n\n');

  clients.add(res);
  // Comment lines keep proxies from closing an idle connection.
  const ping = setInterval(() => res.write(': ping\n\n'), 25_000);

  req.on('close', () => {
    clearInterval(ping);
    clients.delete(res);
  });
}

export function broadcast(event, data = {}) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(payload);
}

export const menuChanged = () => broadcast('menu-updated', { at: Date.now() });
