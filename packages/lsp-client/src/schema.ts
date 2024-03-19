import { z } from 'zod';

import {
  CodeActionParams,
  CodeActionResult,
  ConfigurationParams,
  ConfigurationResult,
  DidChangeTextDocumentParams,
  DidCloseTextDocumentParams,
  DidOpenTextDocumentParams,
  DidSaveTextDocumentParams,
  InitializeParams,
  InitializeResult,
  LogMessageParams,
  PublishDiagnosticsParams,
  RegistrationParams,
  UnregistrationParams,
} from '@izaakschroeder/lsp-schema';

// Notifications that can be sent from server -> client
export const events = {
  'textDocument/publishDiagnostics': {
    params: PublishDiagnosticsParams,
  },
  'window/logMessage': {
    params: LogMessageParams,
  },
} as const;

// Methods that can be called from server -> client
export const callbacks = {
  'client/unregisterCapability': {
    params: UnregistrationParams,
    result: z.null(),
  },
  'client/registerCapability': {
    params: RegistrationParams,
    result: z.null(),
  },
  'workspace/configuration': {
    params: ConfigurationParams,
    result: ConfigurationResult,
  },
} as const;

// Notifications that can be sent from client -> server
export const notifications = {
  'textDocument/didOpen': {
    params: DidOpenTextDocumentParams,
  },
  'textDocument/didChange': {
    params: DidChangeTextDocumentParams,
  },
  'textDocument/didSave': {
    params: DidSaveTextDocumentParams,
  },
  'textDocument/didClose': {
    params: DidCloseTextDocumentParams,
  },
  initialized: {
    params: z.object({}),
  },
  exit: {
    params: z.void(),
  },
} as const;

// Methods that can be called from client -> server
export const methods = {
  'textDocument/codeAction': {
    params: CodeActionParams,
    result: CodeActionResult,
  },

  initialize: {
    params: InitializeParams,
    result: InitializeResult,
  },
  shutdown: {
    params: z.void(),
    result: z.null(),
  },
} as const;

export const all = {
  ...methods,
  ...notifications,
  ...callbacks,
  ...events,
};

type VoidEntries<T> = {
  [P in keyof T as T[P] extends { params: z.ZodVoid } ? P : never]: T[P];
};
type NonVoidEntries<T> = {
  [P in keyof T as T[P] extends { params: z.ZodVoid } ? never : P]: T[P];
};
type VoidNames<T> = keyof VoidEntries<T>;
type NonVoidNames<T> = keyof NonVoidEntries<T>;

export type All = keyof typeof all;

export type Params<T extends All> = (typeof all)[T]['params'];
export type Return<T extends All> = (typeof all)[T] extends { returns: infer U }
  ? U
  : never;
