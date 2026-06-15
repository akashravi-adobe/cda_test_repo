import { state as stateLib } from '@adobe/aio-lib-state';

const DEFAULT_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

async function main(params) {
  const event = params?.data || {};
  const id = event.id || event.eventId || 'unknown';

  try {
    const store = await stateLib.init();
    const key = `pinepapple:event:consume:${id}`;
    const cached = await store.get(key);
    if (cached?.value) {
      return { statusCode: 200, headers: DEFAULT_HEADERS, body: { ok: true, deduped: true, id } };
    }

    await store.put(key, JSON.stringify({ seenAt: new Date().toISOString(), id }));
    return { statusCode: 200, headers: DEFAULT_HEADERS, body: { ok: true, processed: true, id } };
  } catch (error) {
    console.error('consume-event handler failed', { operation: 'consume-event', id, error: error?.message });
    return { statusCode: 500, headers: DEFAULT_HEADERS, body: { ok: false, error: 'Failed to process event' } };
  }
}

export { main };
