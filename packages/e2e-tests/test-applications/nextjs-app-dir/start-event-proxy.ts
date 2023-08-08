import { startEventProxyServer } from './event-proxy-server.ts';

startEventProxyServer({
  port: 3031,
  proxyServerName: 'nextjs-13-app-dir',
});
