import logger, { __RewireAPI__ as rewire } from './index';

describe('Logger: customLogPrinter()', () => {
  test('Only nominal case', () => {
    const customLogPrinter = rewire.__get__('customLogPrinter');
    expect(customLogPrinter({
      level: 'MOCK_LEVEL',
      message: 'MOCK_MESSAGE',
    })).toEqual('[MOCK_LEVEL]: MOCK_MESSAGE');
  });
});

describe('Logger: default export', () => {
  test('Only nominal case', () => {
    expect(() => { logger.info('MOCK_INFO_MESSAGE'); }).not.toThrow();
  });
});
