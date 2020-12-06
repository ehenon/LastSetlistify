import { getMissingConfigVariables } from './index';

describe('Config: getMissingConfigVariables()', () => {
  test('No missing config variables', () => {
    const mockConfig = {
      key: 'value',
    };
    expect(getMissingConfigVariables(mockConfig)).toEqual([]);
  });

  test('Some missing config variables', () => {
    const mockConfig = {
      key1: null,
      key2: null,
    };
    expect(getMissingConfigVariables(mockConfig)).toEqual(['key1', 'key2']);
  });
});
