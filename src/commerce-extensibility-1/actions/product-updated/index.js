import { state as stateLib } from '@adobe/aio-lib-state';

const DEFAULT_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};
const IDEMPOTENCY_PREFIX = 'pinepapple:event:product-updated:';

async function main(params) {
  const payload = params?.data || {};
  const sku = payload.sku || payload.entity_id || 'unknown';
  const key = `${IDEMPOTENCY_PREFIX}${sku}`;

  try {
    const store = await stateLib.init();
    const cached = await store.get(key);
    if (cached?.value) {
      return { statusCode: 200, headers: DEFAULT_HEADERS, body: { ok: true, deduped: true, sku } };
    }

    await store.put(key, JSON.stringify({ seenAt: new Date().toISOString(), sku }));
    return { statusCode: 200, headers: DEFAULT_HEADERS, body: { ok: true, processed: true, sku } };
  } catch (error) {
    console.error('product-updated handler failed', { operation: 'product-updated', sku, error: error?.message });
    return { statusCode: 500, headers: DEFAULT_HEADERS, body: { ok: false, error: 'Failed to process product update' } };
  }
}

export { main };
