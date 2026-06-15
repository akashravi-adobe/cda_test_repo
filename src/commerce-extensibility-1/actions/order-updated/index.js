import { state as stateLib } from '@adobe/aio-lib-state';

const DEFAULT_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};
const IDEMPOTENCY_PREFIX = 'pinepapple:event:order-updated:';

async function withRetry(operation, options = {}) {
  const retries = options.retries || 3;
  const baseDelayMs = options.baseDelayMs || 150;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const statusCode = error?.statusCode || error?.response?.status;
      const retryable = [502, 503, 504].includes(statusCode) || error?.code === 'ETIMEDOUT';
      if (!retryable || attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (2 ** attempt)));
    }
  }

  throw lastError;
}

async function main(params) {
  const payload = params?.data || {};
  const orderId = payload.entity_id || payload.increment_id;
  const key = `${IDEMPOTENCY_PREFIX}${orderId || 'unknown'}`;

  try {
    const store = await stateLib.init();
    const cached = await store.get(key);
    if (cached?.value) {
      return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: { ok: true, deduped: true, orderId },
      };
    }

    await withRetry(async () => {
      await store.put(key, JSON.stringify({ seenAt: new Date().toISOString(), orderId }));
    });

    return {
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: { ok: true, processed: true, orderId },
    };
  } catch (error) {
    console.error('order-updated handler failed', { operation: 'order-updated', orderId, error: error?.message });
    return {
      statusCode: 500,
      headers: DEFAULT_HEADERS,
      body: { ok: false, error: 'Failed to process order update' },
    };
  }
}

export { main };
