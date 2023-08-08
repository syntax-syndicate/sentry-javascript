import { Replay } from '../../src.ts';

describe('Unit | multipleInstances', () => {
  it('throws on creating multiple instances', function () {
    expect(() => {
      new Replay();
      new Replay();
    }).toThrow();
  });
});
