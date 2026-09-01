import { getApiUrl } from '../../../../lib/server-api';

const ALLOWED_ROUTES = new Map([
  ['POST onboarding/personal', 'onboarding/personal'],
  ['GET me', 'me'],
  ['PUT me/preferences', 'me/preferences']
]);

async function proxyPatientRequest(request, context) {
  const { path = [] } = await context.params;
  const route = ALLOWED_ROUTES.get(`${request.method} ${path.join('/')}`);
  if (!route) return Response.json({ error: 'not_found' }, { status: 404 });

  const upstreamUrl = `${getApiUrl()}/v1/patients/${route}`;
  const headers = { 'content-type': request.headers.get('content-type') ?? 'application/json' };
  const authorization = request.headers.get('authorization');
  if (authorization) headers.authorization = authorization;

  const body = request.method === 'GET' ? undefined : await request.text();

  try {
    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: body || undefined,
      cache: 'no-store'
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'cache-control': 'no-store',
        'content-type': response.headers.get('content-type') ?? 'application/json'
      }
    });
  } catch {
    return Response.json({ error: 'api_unavailable' }, { status: 502 });
  }
}

export const GET = proxyPatientRequest;
export const POST = proxyPatientRequest;
export const PUT = proxyPatientRequest;
