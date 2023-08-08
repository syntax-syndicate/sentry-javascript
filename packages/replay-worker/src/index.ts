import workerString from './worker.ts';

/**
 * Get the URL for a web worker.
 */
export function getWorkerURL(): string {
  const workerBlob = new Blob([workerString]);
  return URL.createObjectURL(workerBlob);
}
