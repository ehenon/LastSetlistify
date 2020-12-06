import sleep from './index';

describe('Sleep: default export', () => {
  test('Only nominal case', async () => {
    await expect(sleep(1000)).resolves.toEqual();
  });
});
