import { removeStackFrameModule } from '../../src/server/stacktrace';

describe('removeStackFrameModule', () => {
  it.each([
    [
      'one exception, one frame',
      [
        {
          stacktrace: {
            frames: [
              {
                module: '3-88dda573.js',
                filename: 'server/chunks/3-88dda573.js',
                lineno: 20,
                colno: 33,
              },
            ],
          },
        },
      ],
      [
        {
          stacktrace: {
            frames: [
              {
                filename: 'server/chunks/3-88dda573.js',
                lineno: 20,
                colno: 33,
              },
            ],
          },
        },
      ],
    ],
    [
      'one exception, multiple frames',
      [
        {
          stacktrace: {
            frames: [
              {
                module: '3-88dda573.js',
                filename: 'server/chunks/3-88dda573.js',
                lineno: 20,
                colno: 33,
              },
              {
                module: 'handler.js',
                filename: 'server/handler.js',
                lineno: 20,
                colno: 33,
              },
              {
                module: 'index.js',
                filename: 'server/index.js',
                lineno: 20,
                colno: 33,
              },
            ],
          },
        },
      ],
      [
        {
          stacktrace: {
            frames: [
              {
                filename: 'server/chunks/3-88dda573.js',
                lineno: 20,
                colno: 33,
              },
              {
                filename: 'server/handler.js',
                lineno: 20,
                colno: 33,
              },
              {
                filename: 'server/index.js',
                lineno: 20,
                colno: 33,
              },
            ],
          },
        },
      ],
    ],
    [
      'multiple exceptions, multiple frames',
      [
        {
          stacktrace: {
            frames: [
              {
                module: '3-88dda573.js',
                filename: 'client/chunks/3-88dda573.js',
                lineno: 20,
                colno: 33,
              },
              {
                module: 'handler.js',
                filename: 'client/app.js',
                lineno: 20,
                colno: 33,
              },
            ],
          },
        },
        {
          stacktrace: {
            frames: [
              {
                module: '3-88dda573.js',
                filename: 'client/chunks/3-88dda573.js',
                lineno: 20,
                colno: 33,
              },
              {
                filename: 'client/app.js',
                lineno: 20,
                colno: 33,
              },
            ],
          },
        },
      ],
      [
        {
          stacktrace: {
            frames: [
              {
                filename: 'client/chunks/3-88dda573.js',
                lineno: 20,
                colno: 33,
              },
              {
                filename: 'client/app.js',
                lineno: 20,
                colno: 33,
              },
            ],
          },
        },
        {
          stacktrace: {
            frames: [
              {
                filename: 'client/chunks/3-88dda573.js',
                lineno: 20,
                colno: 33,
              },
              {
                filename: 'client/app.js',
                lineno: 20,
                colno: 33,
              },
            ],
          },
        },
      ],
    ],
  ])('removes the module name from all stack frames (%s)', (_, originalExceptionValues, modifiedExceptionValues) => {
    const event = {
      exception: {
        values: originalExceptionValues,
      },
    };
    const result = removeStackFrameModule(event);

    expect(result.exception!.values).toStrictEqual(modifiedExceptionValues);
  });

  it.each([
    [
      'no stack frames',
      {
        stacktrace: {
          frames_omitted: [0, 0],
        },
      },
    ],
    ['no stack trace but top level module', { module: '3-88dda573.js' }],
    ['no stack trace', {}],
  ])("doesn't modify events without stack traces or frames (%s)", (_, originalExceptionValue) => {
    const event = {
      exception: {
        values: [originalExceptionValue],
      },
    };
    const result = removeStackFrameModule(event);

    expect(result.exception!.values).toStrictEqual([originalExceptionValue]);
  });
});
