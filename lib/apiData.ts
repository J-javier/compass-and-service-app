/**
 * Laravel API Resources may wrap payloads in `{ data: ... }`. Accept both the
 * wrapped and bare shapes so hooks don't break if an endpoint changes style.
 */
export function unwrapData<T>(body: unknown): T {
  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    const keys = Object.keys(body as object);
    // Only unwrap pure envelopes ({data} or {data, meta, links}); keep
    // responses like {data, progress} intact for the caller.
    if (keys.every((k) => k === 'data' || k === 'meta' || k === 'links')) {
      return (body as { data: T }).data;
    }
  }
  return body as T;
}
