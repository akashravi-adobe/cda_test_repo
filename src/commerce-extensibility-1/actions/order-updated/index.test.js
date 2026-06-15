import { jest } from '@jest/globals';

const getMock = jest.fn();
const putMock = jest.fn();
const initMock = jest.fn(async () => ({ get: getMock, put: putMock }));

jest.unstable_mockModule('@adobe/aio-lib-state', () => ({
  state: { init: initMock },
}));

const { main } = await import('./index.js');

describe('order-updated', () => {
  beforeEach(() => {
    getMock.mockReset();
    putMock.mockReset();
    initMock.mockClear();
  });

  it('processes a new event', async () => {
    getMock.mockResolvedValueOnce(null);
    putMock.mockResolvedValueOnce();

    const result = await main({ data: { entity_id: 42, increment_id: '100000042' } });

    expect(result.statusCode).toBe(200);
    expect(result.body.processed).toBe(true);
    expect(putMock).toHaveBeenCalled();
  });

  it('dedupes a repeated event', async () => {
    getMock.mockResolvedValueOnce({ value: 'cached' });

    const result = await main({ data: { entity_id: 42 } });

    expect(result.statusCode).toBe(200);
    expect(result.body.deduped).toBe(true);
    expect(putMock).not.toHaveBeenCalled();
  });

  it('returns 500 on failure', async () => {
    getMock.mockRejectedValueOnce(new Error('storage unavailable'));

    const result = await main({ data: { entity_id: 42 } });

    expect(result.statusCode).toBe(500);
    expect(result.body.ok).toBe(false);
  });
});
