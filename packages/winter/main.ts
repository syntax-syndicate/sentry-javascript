import {
  DenoClient,
  DenoClientOptions,
  getCurrentHub,
  initAndBind,
  makeDenoTransport,
} from "./client.ts";

initAndBind(DenoClient, {
  dsn:
    "https://e5b1b3c6d5e342cc82f9fb165b9ddf90@o333688.ingest.sentry.io/4505188157620224",
  transport: makeDenoTransport,
  integrations: [],
  beforeSend(event, hint) {
    console.log(event);
    return event;
  },
});

const hub = getCurrentHub();
const client = hub.getClient();

client?.captureException(new Error("Hello from Deno!"));
