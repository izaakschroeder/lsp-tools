/**
 * This file is the `zod` types of interfaces provided by the LSP spec.
 * See: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/
 */
import { z } from 'zod';

export const TextDocumentSyncKind = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
]);

export const TextDocumentSyncOptions = z.object({
  openClose: z.boolean().optional(),
  change: TextDocumentSyncKind.optional(),
});

export const MessageType = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const CodeActionTriggerKind = z.union([z.literal(1), z.literal(2)]);

export const LogMessageParams = z.object({
  type: MessageType,
  message: z.string(),
});

export const Unregistration = z.object({
  id: z.string(),
  method: z.string(),
});

export const UnregistrationParams = z.object({
  unregisterations: z.array(Unregistration),
});

export const Registration = z.object({
  id: z.string(),
  method: z.string(),
  registerOptions: z.any().optional(),
});

export const RegistrationParams = z.object({
  registrations: z.array(Registration),
});

export const ConfigurationItem = z.object({
  scopeUri: z.string().optional(),
  section: z.string().optional(),
});

export const ConfigurationParams = z.object({
  items: z.array(ConfigurationItem),
});

export const TextDocumentItem = z.object({
  uri: z.string(),
  languageId: z.string(),
  version: z.number().int(),
  text: z.string(),
});

export const DidOpenTextDocumentParams = z.object({
  textDocument: TextDocumentItem,
});

export const TextDocumentIdentifier = z.object({
  uri: z.string(),
});

export const VersionedTextDocumentIdentifier = TextDocumentIdentifier.extend({
  version: z.number().int(),
});

export const Position = z.object({
  line: z.number().int(),
  character: z.number().int(),
});

export const Range = z.object({
  start: Position,
  end: Position,
});

export type Range = z.infer<typeof Range>;

export const TextDocumentContentChangeEvent = z.union([
  z.object({
    range: Range,
    text: z.string(),
  }),
  z.object({
    text: z.string(),
  }),
]);

export type TextDocumentContentChangeEvent = z.infer<
  typeof TextDocumentContentChangeEvent
>;

export const DidChangeTextDocumentParams = z.object({
  textDocument: VersionedTextDocumentIdentifier,
  contentChanges: z.array(TextDocumentContentChangeEvent),
});

export const Location = z.object({
  uri: z.string(),
  range: Range,
});

export const DiagnosticRelatedInformation = z.object({
  location: Location,
  message: z.string(),
});

export const DiagnosticSeverity = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const DiagnosticTag = z.union([z.literal(1), z.literal(2)]);

export const CodeDescription = z.object({
  href: z.string(),
});

export const Diagnostic = z.object({
  range: Range,
  severity: DiagnosticSeverity.optional(),
  code: z.union([z.string(), z.number().int()]).optional(),
  codeDescription: CodeDescription.optional(),
  source: z.string().optional(),
  message: z.string(),
  tags: z.array(DiagnosticTag).optional(),
  relatedInformation: z.array(DiagnosticRelatedInformation).optional(),
  data: z.unknown().optional(),
});

export const CodeActionKind = z.union([
  z.literal(''),
  z.literal('quickfix'),
  z.literal('refactor'),
  z.literal('refactor.extract'),
  z.literal('refactor.inline'),
  z.literal('refactor.rewrite'),
  z.literal('source'),
  z.literal('source.organizeImports'),
  z.literal('source.fixAll'),
]);

export const CodeActionContext = z.object({
  diagnostics: z.array(Diagnostic),
  only: z.array(CodeActionKind).optional(),
  triggerKind: CodeActionTriggerKind.optional(),
});

export const CodeActionParams = z.object({
  textDocument: TextDocumentIdentifier,
  range: Range,
  context: CodeActionContext,
});

export const PublishDiagnosticsParams = z.object({
  uri: z.string(),
  version: z.number().int().optional(),
  diagnostics: z.array(Diagnostic),
});

export const DidSaveTextDocumentParams = z.object({
  textDocument: TextDocumentIdentifier,
  text: z.string().optional(),
});

export const DidCloseTextDocumentParams = z.object({
  textDocument: TextDocumentIdentifier,
});

export const TextEdit = z.object({
  range: Range,
  newText: z.string(),
});

export type TextEdit = z.infer<typeof TextEdit>;

export const WorkspaceEdit = z.object({
  changes: z.record(z.array(TextEdit)),
});

// kind of ApplyWorkspaceEditParams?
// can't find reference to this
export const CodeActionItem = z.object({
  title: z.string(),
  kind: z.string(),
  edit: WorkspaceEdit,
});

export type CodeActionItem = z.infer<typeof CodeActionItem>;

// This is supposed to be `Command[]` but
// clearly not true?
export const CodeActionResult = z.array(CodeActionItem);

export const ConfigurationResult = z.array(z.any());

export const ResourceOperationKind = z.enum(['create', 'rename', 'delete']);
export const FailureHandlingKind = z.enum(['abort', 'transactional', 'undo']);
export const SymbolKind = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
  z.literal(11),
  z.literal(12),
  z.literal(13),
  z.literal(14),
  z.literal(15),
  z.literal(16),
  z.literal(17),
  z.literal(18),
  z.literal(19),
  z.literal(20),
  z.literal(21),
  z.literal(22),
  z.literal(23),
  z.literal(24),
  z.literal(25),
  z.literal(26),
]);

export const SymbolTag = z.literal(1);

export const WorkspaceEditClientCapabilities = z.object({
  documentChanges: z.boolean().optional(),
  resourceOperations: z.array(ResourceOperationKind).optional(),
  failureHandling: FailureHandlingKind.optional(),
  normalizesLineEndings: z.boolean().optional(),
  changeAnnotationSupport: z
    .object({
      groupsOnLabel: z.boolean().optional(),
    })
    .optional(),
});
export const DidChangeConfigurationClientCapabilities = z.object({
  dynamicRegistration: z.boolean().optional(),
});
export const DidChangeWatchedFilesClientCapabilities = z.object({
  dynamicRegistration: z.boolean().optional(),
  relativePatternSupport: z.boolean().optional(),
});
export const WorkspaceSymbolClientCapabilities = z.object({
  dynamicRegistration: z.boolean().optional(),
  symbolKind: z
    .object({
      valueSet: z.array(SymbolKind).optional(),
    })
    .optional(),
  tagSupport: z
    .object({
      valueSet: z.array(SymbolTag).optional(),
    })
    .optional(),
  resolveSupport: z
    .object({
      properties: z.array(z.string()),
    })
    .optional(),
});
export const ExecuteCommandClientCapabilities = z.object({
  dynamicRegistration: z.boolean().optional(),
});
export const SemanticTokensWorkspaceClientCapabilities = z.object({
  refreshSupport: z.boolean().optional(),
});
export const CodeLensWorkspaceClientCapabilities = z.object({
  refreshSupport: z.boolean().optional(),
});
export const InlineValueWorkspaceClientCapabilities = z.object({
  refreshSupport: z.boolean().optional(),
});
export const InlayHintWorkspaceClientCapabilities = z.object({
  refreshSupport: z.boolean().optional(),
});
export const DiagnosticWorkspaceClientCapabilities = z.object({
  refreshSupport: z.boolean().optional(),
});

export const TextDocumentSyncClientCapabilities = z.object({
  dynamicRegistration: z.boolean().optional(),
  willSave: z.boolean().optional(),
  willSaveWaitUntil: z.boolean().optional(),
  didSave: z.boolean().optional(),
});
export const CompletionClientCapabilities = z.object({});
export const HoverClientCapabilities = z.object({});
export const SignatureHelpClientCapabilities = z.object({});
export const DeclarationClientCapabilities = z.object({});
export const DefinitionClientCapabilities = z.object({});
export const TypeDefinitionClientCapabilities = z.object({});
export const ImplementationClientCapabilities = z.object({});
export const ReferenceClientCapabilities = z.object({});
export const DocumentHighlightClientCapabilities = z.object({});
export const DocumentSymbolClientCapabilities = z.object({});
export const CodeActionClientCapabilities = z.object({});
export const CodeLensClientCapabilities = z.object({});
export const DocumentLinkClientCapabilities = z.object({});
export const DocumentColorClientCapabilities = z.object({});
export const DocumentFormattingClientCapabilities = z.object({});
export const DocumentRangeFormattingClientCapabilities = z.object({});
export const DocumentOnTypeFormattingClientCapabilities = z.object({});
export const RenameClientCapabilities = z.object({});
export const PublishDiagnosticsClientCapabilities = z.object({});
export const FoldingRangeClientCapabilities = z.object({});
export const SelectionRangeClientCapabilities = z.object({});
export const LinkedEditingRangeClientCapabilities = z.object({});
export const CallHierarchyClientCapabilities = z.object({});
export const SemanticTokensClientCapabilities = z.object({});
export const MonikerClientCapabilities = z.object({});
export const TypeHierarchyClientCapabilities = z.object({});
export const InlineValueClientCapabilities = z.object({});
export const InlayHintClientCapabilities = z.object({});
export const DiagnosticClientCapabilities = z.object({});

export const TextDocumentClientCapabilities = z.object({
  synchronization: TextDocumentSyncClientCapabilities.optional(),
  completion: CompletionClientCapabilities.optional(),
  hover: HoverClientCapabilities.optional(),
  signatureHelp: SignatureHelpClientCapabilities.optional(),
  declaration: DeclarationClientCapabilities.optional(),
  definition: DefinitionClientCapabilities.optional(),
  typeDefinition: TypeDefinitionClientCapabilities.optional(),
  implementation: ImplementationClientCapabilities.optional(),
  references: ReferenceClientCapabilities.optional(),
  documentHighlight: DocumentHighlightClientCapabilities.optional(),
  documentSymbol: DocumentSymbolClientCapabilities.optional(),
  codeAction: CodeActionClientCapabilities.optional(),
  codeLens: CodeLensClientCapabilities.optional(),
  documentLink: DocumentLinkClientCapabilities.optional(),
  colorProvider: DocumentColorClientCapabilities.optional(),
  formatting: DocumentFormattingClientCapabilities.optional(),
  rangeFormatting: DocumentRangeFormattingClientCapabilities.optional(),
  onTypeFormatting: DocumentOnTypeFormattingClientCapabilities.optional(),
  rename: RenameClientCapabilities.optional(),
  publishDiagnostics: PublishDiagnosticsClientCapabilities.optional(),
  foldingRange: FoldingRangeClientCapabilities.optional(),
  selectionRange: SelectionRangeClientCapabilities.optional(),
  linkedEditingRange: LinkedEditingRangeClientCapabilities.optional(),
  callHierarchy: CallHierarchyClientCapabilities.optional(),
  semanticTokens: SemanticTokensClientCapabilities.optional(),
  moniker: MonikerClientCapabilities.optional(),
  typeHierarchy: TypeHierarchyClientCapabilities.optional(),
  inlineValue: InlineValueClientCapabilities.optional(),
  inlayHint: InlayHintClientCapabilities.optional(),
  diagnostic: DiagnosticClientCapabilities.optional(),
});
export const NotebookDocumentClientCapabilities = z.object({});
export const ShowMessageRequestClientCapabilities = z.object({});
export const ShowDocumentClientCapabilities = z.object({});
export const RegularExpressionsClientCapabilities = z.object({});
export const MarkdownClientCapabilities = z.object({});
export const PositionEncodingKind = z.enum(['utf-8', 'utf-16', 'utf-32']);

export const ClientCapabilities = z.object({
  workspace: z
    .object({
      applyEdit: z.boolean().optional(),
      workspaceEdit: WorkspaceEditClientCapabilities.optional(),
      didChangeConfiguration:
        DidChangeConfigurationClientCapabilities.optional(),
      didChangeWatchedFiles: DidChangeWatchedFilesClientCapabilities.optional(),
      symbol: WorkspaceSymbolClientCapabilities.optional(),
      executeCommand: ExecuteCommandClientCapabilities.optional(),
      workspaceFolders: z.boolean().optional(),
      configuration: z.boolean().optional(),
      semanticTokens: SemanticTokensWorkspaceClientCapabilities.optional(),
      codeLens: CodeLensWorkspaceClientCapabilities.optional(),
      fileOperations: z
        .object({
          dynamicRegistration: z.boolean().optional(),
          didCreate: z.boolean().optional(),
          willCreate: z.boolean().optional(),
          didRename: z.boolean().optional(),
          willRename: z.boolean().optional(),
          didDelete: z.boolean().optional(),
          willDelete: z.boolean().optional(),
        })
        .optional(),
      inlineValue: InlineValueWorkspaceClientCapabilities.optional(),
      inlayHint: InlayHintWorkspaceClientCapabilities.optional(),
      diagnostics: DiagnosticWorkspaceClientCapabilities.optional(),
    })
    .optional(),
  textDocument: TextDocumentClientCapabilities.optional(),
  notebookDocument: NotebookDocumentClientCapabilities.optional(),
  window: z
    .object({
      workDoneProgress: z.boolean().optional(),
      showMessage: ShowMessageRequestClientCapabilities.optional(),
      showDocument: ShowDocumentClientCapabilities.optional(),
    })
    .optional(),
  general: z
    .object({
      staleRequestSupport: z
        .object({
          cancel: z.boolean(),
          retryOnContentModified: z.array(z.string()),
        })
        .optional(),
      regularExpressions: RegularExpressionsClientCapabilities.optional(),
      markdown: MarkdownClientCapabilities.optional(),
      positionEncodings: z.array(PositionEncodingKind).optional(),
    })
    .optional(),
  experimental: z.any().optional(),
});

export const WorkspaceFolder = z.object({
  uri: z.string(),
  name: z.string(),
});

export const TraceValue = z.enum(['off', 'messages', 'verbose']);

export const InitializeParams = z.object({
  processId: z.number().int().nullable(),
  clientInfo: z
    .object({
      name: z.string(),
      version: z.string().optional(),
    })
    .optional(),
  locale: z.string().optional(),
  capabilities: ClientCapabilities,
  workspaceFolders: z.array(WorkspaceFolder).nullable().optional(),
  rootUri: z.string().nullable().optional(),
  initializationOptions: z.any().optional(),
  rootPath: z.string().nullable().optional(),
  trace: TraceValue.optional(),
});

export const WorkspaceFoldersServerCapabilities = z.object({
  supported: z.boolean().optional(),
  changeNotifications: z.union([z.string(), z.boolean()]).optional(),
});

export const CodeActionOptions = z.object({
  codeActionKinds: z.array(CodeActionKind).optional(),
  resolveProvider: z.boolean().optional(),
});

export const ServerCapabilities = z.object({
  positionEncoding: PositionEncodingKind.optional(),
  codeActionProvider: z.union([z.boolean(), CodeActionOptions]).optional(),
  textDocumentSync: z
    .union([TextDocumentSyncKind, TextDocumentSyncOptions])
    .optional(),
  workspace: z
    .object({
      workspaceFolders: WorkspaceFoldersServerCapabilities.optional(),
      fileOperations: z.object({}).optional(),
    })
    .optional(),
});

export const InitializeResult = z.object({
  capabilities: ServerCapabilities,
  serverInfo: z
    .object({
      name: z.string(),
      version: z.string().optional(),
    })
    .optional(),
});
