import { makeBaseNPMConfig, makeNPMConfigVariants } from '@sentry-internal/rollup-utils';

export default [
  ...makeNPMConfigVariants(
    makeBaseNPMConfig({
      entrypoints: [
        'src/index.client.ts',
        'src/index.server.ts',
        'src/client/index.ts',
        'src/server/index.ts',
        'src/solidrouter.ts',
        'src/solidrouter.client.ts',
        'src/solidrouter.server.ts',
        'src/client/solidrouter.ts',
        'src/server/solidrouter.ts',
      ],
      // prevent this internal code from ending up in our built package (this doesn't happen automatically because
      // the name doesn't match an SDK dependency)
      packageSpecificConfig: {
        external: ['solid-js/web', 'solid-js', '@sentry/solid', '@sentry/solid/solidrouter'],
        output: {
          dynamicImportInCjs: true,
        },
      },
    }),
  ),
  ...makeNPMConfigVariants(
    makeBaseNPMConfig({
      entrypoints: ['src/nitro/sentryNitroInstrumentationPlugin.ts'],
      packageSpecificConfig: {
        external: ['nitropack/runtime', 'h3'],
        output: {
          // We import some, but not all, utils from src/server.
          // If we preserve modules it would treeshake out other
          // utils the SDK depends on because the nitro
          // instrumentation plugin does not.
          // Therefore, we just bundle them all into the plugin.
          preserveModules: false,
          // Preserve the original file structure (i.e., so that everything is still relative to `src`)
          entryFileNames: 'nitro/[name].js',
        },
      },
    }),
  ),
];
