import * as fs from 'node:fs/promises';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';

import type {
  CodeActionItem,
  LspClient,
  TextEdit,
} from '@izaakschroeder/lsp-client';

import { applyTextEdits } from './applyTextEdits';
import { rangesOverlap } from './rangesOverlap';

const languageMap = {
  '.js': 'javascript',
  '.cjs': 'javascript',
  '.jsx': 'javascriptreact',
  '.ts': 'typescript',
  '.tsx': 'typescriptreact',
  '.mjs': 'javascript',
  '.mts': 'typescript',
};

interface FixFileOptions {
  actionFilter?: ((action: CodeActionItem) => boolean) | null | undefined;
  actionMap?: ((action: CodeActionItem) => CodeActionItem) | null | undefined;
}

export const fixFile = async (
  lsp: LspClient,
  path: string,
  options: FixFileOptions,
) => {
  const uri = pathToFileURL(path).href;
  const ext = extname(path) as keyof typeof languageMap;
  const languageId = languageMap[ext];

  if (!languageId) {
    throw new Error(`Missing language for ${ext}.`);
  }

  const text = await fs.readFile(path, 'utf8');
  let version = 1;

  lsp.notify('textDocument/didOpen', {
    textDocument: {
      uri,
      languageId,
      version,
      text,
    },
  });

  const textDocument = { uri };

  const lines = text.split('\n');

  const fix = async (count = 0): Promise<boolean> => {
    if (count > 100) {
      console.log(`File has been fixed more than 100 times: ${path}`);
      return false;
    }
    if (!lines.length) {
      return false;
    }
    const actions = await lsp.request('textDocument/codeAction', {
      textDocument,
      range: {
        start: { line: 0, character: 0 },
        end: {
          line: lines.length - 1,
          character: lines[lines.length - 1]?.length ?? 0,
        },
      },
      context: {
        diagnostics: [],
        triggerKind: 1,
      },
    });
    if (actions.length === 0) {
      return false;
    }
    let desiredActions = actions.filter((action) => {
      return (
        (options.actionFilter ? options.actionFilter(action) : true) &&
        action.edit.changes[uri] &&
        Object.keys(action.edit.changes).length === 1
      );
    });
    if (options.actionMap) {
      desiredActions = desiredActions.map(options.actionMap);
    }

    const finalChanges: TextEdit[] = [];
    const finalActions: CodeActionItem[] = [];
    for (const action of desiredActions) {
      const fileChanges = action.edit.changes[uri];
      if (!fileChanges) {
        throw new Error();
      }
      const anyOverlaps = finalChanges.some((otherChange) => {
        return fileChanges.some((currentChange) => {
          return rangesOverlap(otherChange.range, currentChange.range);
        });
      });
      if (anyOverlaps) {
        continue;
      }
      finalActions.push(action);
      finalChanges.push(...fileChanges);
    }

    if (finalChanges.length > 0) {
      const contentChanges = applyTextEdits(lines, finalChanges);
      version += 1;
      lsp.notify('textDocument/didChange', {
        textDocument: { ...textDocument, version },
        contentChanges,
      });
    } else {
      return false;
    }

    if (finalActions.length < desiredActions.length) {
      await fix(count + 1);
    }

    return true;
  };

  const changed = await fix();
  if (changed) {
    const newText = lines.join('\n');
    fs.writeFile(path, newText);
    lsp.notify('textDocument/didSave', {
      textDocument,
      text: newText,
    });
  }

  lsp.notify('textDocument/didClose', {
    textDocument,
  });
};
