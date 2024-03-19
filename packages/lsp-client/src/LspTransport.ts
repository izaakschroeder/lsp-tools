import type { JSONRPCRequest, JSONRPCResponse } from 'json-rpc-2.0';
import type { All, Params } from './schema';

export type JSONRPCPayload = JSONRPCRequest | JSONRPCResponse;

export interface LspConnectionParams {
  receive: (json: JSONRPCPayload) => void | Promise<void>;
  onClose: () => void;
  tap: <T extends All>(evt: T, fn: (param: Params<T>) => void) => () => void;
}

export interface LspConnection {
  send: (json: JSONRPCPayload) => void | Promise<void>;
}

export interface LspTransport {
  connect: (json: LspConnectionParams) => LspConnection;
}
