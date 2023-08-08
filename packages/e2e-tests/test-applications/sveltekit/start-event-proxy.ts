import { startEventProxyServer } from './event-proxy-server.ts';

startEventProxyServer({
  port: 3031,
  proxyServerName: 'sveltekit',
});
