import { state as stateLib } from '@adobe/aio-lib-state';

const DEFAULT_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};
const IDEMPOTENCY_PREFIX = 'pinepapple:event:inventory-updated:';

async function main(params) {
  const payload = params?.data || {};
  const sku = payload.sku || 'unknown';
  const key = `${IDEMPOTENCY_PREFIX}${sku}:${payload.source_code || 'source'}`;

  try {
    const store = await stateLib.init();
    const cached = await store.get(key);
    if (cached?.value) {
      return { statusCode: 200, headers: DEFAULT_HEADERS, body: { ok: true, deduped: true, sku } };
    }

    await store.put(key, JSON.stringify({ seenAt: new Date().toISOString(), sku }));
    return { statusCode: 200, headers: DEFAULT_HEADERS, body: { ok: true, processed: true, sku } };
  } catch (error) {
    console.error('inventory-updated handler failed', { operation: 'inventory-updated', sku, error: error?.message });
    return { statusCode: 500, headers: DEFAULT_HEADERS, body: { ok: false, error: 'Failed to process inventory update' } };
  }
}

export { main };
