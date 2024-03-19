import { EventEmitter } from 'node:events';
import {
  JSONRPCClient,
  JSONRPCServer,
  JSONRPCServerAndClient,
} from 'json-rpc-2.0';
import type { z } from 'zod';

import type {
  JSONRPCPayload,
  LspConnection,
  LspTransport,
} from './LspTransport';
import {
  events,
  type All,
  type Params,
  callbacks,
  methods,
  notifications,
} from './schema';

type VoidEntries<T> = {
  [P in keyof T as T[P] extends { params: z.ZodVoid } ? P : never]: T[P];
};
type NonVoidEntries<T> = {
  [P in keyof T as T[P] extends { params: z.ZodVoid } ? never : P]: T[P];
};
type VoidNames<T> = keyof VoidEntries<T>;
type NonVoidNames<T> = keyof NonVoidEntries<T>;

export class LspClient {
  #rpc: JSONRPCServerAndClient;
  #events = new EventEmitter();
  #connections: LspConnection[] = [];

  constructor() {
    this.#rpc = new JSONRPCServerAndClient(
      new JSONRPCServer(),
      new JSONRPCClient((req) => {
        this.#send(req);
      }),
    );

    // TODO(@izaakschroeder): Figure out how to do this properly.
    this.callback('client/unregisterCapability', () => {
      return null;
    });
    this.callback('client/registerCapability', () => {
      return null;
    });
  }

  async connect(transport: LspTransport) {
    const connection = await transport.connect({
      tap: (name, fn) => {
        return this.tap(name, fn);
      },
      receive: (req: JSONRPCPayload) => {
        this.#rpc.receiveAndSend(req);
      },
      onClose: () => {
        const index = this.#connections.indexOf(connection);
        if (index === -1) {
          return;
        }
        this.#connections.splice(index, 1);
      },
    });
    this.#connections.push(connection);
  }

  #send(req: JSONRPCPayload) {
    for (const connection of this.#connections) {
      connection.send(req);
    }
  }

  callback<N extends keyof typeof callbacks>(
    name: N,
    fn: (
      params: z.infer<(typeof callbacks)[N]['params']>,
    ) =>
      | Promise<z.infer<(typeof callbacks)[N]['result']>>
      | z.infer<(typeof callbacks)[N]['result']>,
  ) {
    if (this.#rpc.hasMethod(name)) {
      throw new Error(`Callback already registered for ${name}.`);
    }
    const method = callbacks[name];
    this.#rpc.addMethod(name, async (params) => {
      const arg = method.params.parse(params);
      const res = method.result.parse(await fn(arg));
      this.#events.emit(`$tap-${name}`, arg);
      return res;
    });
  }

  on<N extends keyof typeof events>(
    name: N,
    fn: (params: z.infer<(typeof events)[N]['params']>) => Promise<void> | void,
  ) {
    if (!this.#rpc.hasMethod(name)) {
      const method = events[name];
      this.#rpc.addMethod(name, async (params) => {
        const arg = method.params.parse(params);
        this.#events.emit(name, arg);
        this.#events.emit(`$tap-${name}`, arg);
      });
    }
    this.#events.addListener(name, fn);
    return () => this.#events.removeListener(name, fn);
  }

  request<N extends VoidNames<typeof methods>>(
    name: N,
  ): Promise<z.infer<(typeof methods)[N]['result']>>;
  request<N extends NonVoidNames<typeof methods>>(
    name: N,
    params: z.infer<(typeof methods)[N]['params']>,
  ): Promise<z.infer<(typeof methods)[N]['result']>>;
  async request<N extends keyof typeof methods>(
    name: N,
    params?: z.infer<(typeof methods)[N]['params']>,
  ): Promise<z.infer<(typeof methods)[N]['result']>> {
    const method = methods[name];
    const arg = method.params.parse(params);
    const result = method.result.parse(await this.#rpc.request(name, arg));
    this.#events.emit(`$tap-${name}`, arg);
    return result;
  }

  notify<N extends VoidNames<typeof notifications>>(name: N): void;
  notify<N extends NonVoidNames<typeof notifications>>(
    name: N,
    params: z.infer<(typeof notifications)[N]['params']>,
  ): void;
  notify<N extends keyof typeof notifications>(
    name: N,
    params?: z.infer<(typeof notifications)[N]['params']>,
  ) {
    const method = notifications[name];
    const arg = method.params.parse(params);
    this.#rpc.notify(name, arg);
    this.#events.emit(`$tap-${name}`, arg);
  }

  tap<N extends All>(name: N, cb: (params: Params<N>) => void) {
    this.#events.addListener(`$tap-${name}`, cb);
    return () => this.#events.removeListener(`$tap-${name}`, cb);
  }
}
