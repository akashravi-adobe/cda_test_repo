import { jest } from '@jest/globals';

const getMock = jest.fn();
const putMock = jest.fn();
const initMock = jest.fn(async () => ({ get: getMock, put: putMock }));

jest.unstable_mockModule('@adobe/aio-lib-state', () => ({
  state: { init: initMock },
}));

const { main } = await import('./index.js');

describe('inventory-updated', () => {
  beforeEach(() => {
    getMock.mockReset();
    putMock.mockReset();
  });

  it('processes a new event', async () => {
    getMock.mockResolvedValueOnce(null);
    putMock.mockResolvedValueOnce();

    const result = await main({ data: { sku: 'pinepro-1', source_code: 'default' } });

    expect(result.statusCode).toBe(200);
    expect(result.body.processed).toBe(true);
  });

  it('dedupes a repeated event', async () => {
    getMock.mockResolvedValueOnce({ value: 'cached' });

    const result = await main({ data: { sku: 'pinepro-1', source_code: 'default' } });

    expect(result.body.deduped).toBe(true);
    expect(putMock).not.toHaveBeenCalled();
  });
});
