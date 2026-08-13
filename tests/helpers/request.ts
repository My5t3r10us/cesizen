import { NextRequest } from 'next/server';

interface CallOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string>;
  token?: string;
  headers?: Record<string, string>;
}

/**
 * Construit un NextRequest à partir d'options.
 * Les Route Handlers Next sont appelés directement avec ce request,
 * pas besoin d'un serveur HTTP.
 */
export function buildRequest(
  url: string,
  opts: CallOptions = {}
): NextRequest {
  const u = new URL(url, 'http://localhost:3000');
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      u.searchParams.set(k, v);
    }
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
  });
  if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`);

  const init: { method: string; headers: Headers; body?: string } = {
    method: opts.method ?? 'GET',
    headers,
  };
  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
  }

  return new NextRequest(u.toString(), init);
}

export async function readJson<T = unknown>(
  res: Response
): Promise<{ status: number; body: T }> {
  const status = res.status;
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status, body: body as T };
}
