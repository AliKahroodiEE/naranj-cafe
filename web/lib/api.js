// Browser-side helper for calling the API through the /api rewrite.
export async function api(path, { method = "GET", body, form } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: form ?? (body ? JSON.stringify(body) : undefined),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // AdminShell listens for this and sends the admin back to the login page.
    if (res.status === 401) window.dispatchEvent(new Event("admin:unauthorized"));
    const err = new Error(data.error || "ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.");
    err.status = res.status;
    throw err;
  }
  return data;
}
