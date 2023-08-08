import setupStaticAssets from './utils/staticAssets.ts';

export default function globalSetup(): Promise<void> {
  return setupStaticAssets();
}
