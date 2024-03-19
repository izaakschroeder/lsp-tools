import { spawn } from 'node:child_process';
import { LspStdioStream } from './LspStdioStream';
import type {
  JSONRPCPayload,
  LspConnectionParams,
  LspTransport,
} from './LspTransport';

export class LspStdioTransport implements LspTransport {
  #bin: string;
  #args: string[];

  constructor(bin: string, args: string[] = []) {
    this.#bin = bin;
    this.#args = args;
  }

  connect(params: LspConnectionParams) {
    const child = spawn(this.#bin, this.#args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    params.tap('exit', () => {
      child.kill();
    });

    child.stdout.pipe(new LspStdioStream()).on('data', params.receive);
    child.on('exit', (_code) => {
      // TODO(@izaakschroeder): Propagate error information
      params.onClose();
    });
    child.on('error', (_err) => {
      // TODO(@izaakschroeder): Propagate error information
      params.onClose();
    });
    return {
      send: (json: JSONRPCPayload) => {
        if (child.killed) {
          throw new Error();
        }
        const payload = JSON.stringify(json);
        const len = Buffer.byteLength(payload);
        child.stdin.write(`Content-Length: ${len}\r\n\r\n${payload}`);
      },
    };
  }
}
