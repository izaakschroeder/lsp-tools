import { LspStdioTransport } from './LspStdioTransport';

export const createTransport = (urlString: string) => {
  const url = new URL(urlString);
  switch (url.protocol) {
    case 'stdio': {
      const bin = url.hostname;
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
