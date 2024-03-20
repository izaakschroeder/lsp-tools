import { fileURLToPath } from 'node:url';
import { LspStdioTransport } from './LspStdioTransport';

export const createTransport = (urlString: string) => {
  const url = new URL(urlString);
  switch (url.protocol) {
    case 'stdio:': {
      if (url.hostname) {
        // TODO: Consider resolving non-absolute paths
        throw new TypeError('Path must be absolute');
      }
      const bin = fileURLToPath(`file://${url.pathname}`);
      const args = url.searchParams.getAll('arg');
      return new LspStdioTransport(bin, args);
    }
    case 'http:':
    case 'https:':
      throw new Error('HTTP support coming soon™');
    default:
      throw new Error(`Unsupported protocol ${url.protocol}`);
  }
};
