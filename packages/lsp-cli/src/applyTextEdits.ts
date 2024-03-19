import type {
  TextDocumentContentChangeEvent,
  TextEdit,
} from '@izaakschroeder/lsp-client';

/**
 * All text edits ranges refer to positions in the document they are
 * computed on. They therefore move a document from state S1 to S2
 * without describing any intermediate state. Text edits ranges must
 * never overlap, that means no part of the original document must be
 * manipulated by more than one edit. However, it is possible that
 * multiple edits have the same start position: multiple inserts, or
 * any number of inserts followed by a single remove or replace edit.
 * If multiple inserts have the same position, the order in the array
 * defines the order in which the inserted strings appear in the
 * resulting text.
 */
export const applyTextEdits = (
  lines: string[],
  edits: TextEdit[],
): TextDocumentContentChangeEvent[] => {
  const out = [];
  edits.sort((a, b) => {
    const diff = b.range.start.line - a.range.start.line;
    if (diff) {
      return diff;
    }
    return b.range.start.character - a.range.start.character;
  });

  for (const edit of edits) {
    const startLineText = lines[edit.range.start.line];
    const endLineText = lines[edit.range.end.line];
    const newLines = edit.newText.split('\n');

    let newFirstLine = newLines[0] ?? '';
    newFirstLine = startLineText
      ? startLineText.substring(0, edit.range.start.character) + newFirstLine
      : newFirstLine;
    newLines[0] = newFirstLine;

    let newEndLine = newLines[newLines.length - 1] ?? '';
    newEndLine = endLineText
      ? newEndLine + endLineText.substring(edit.range.end.character)
      : newEndLine;
    newLines[newLines.length - 1] = newEndLine;

    const removed = edit.range.end.line - edit.range.start.line + 1;

    lines.splice(edit.range.start.line, removed, ...newLines);

    out.push({
      text: edit.newText,
      range: edit.range,
    });
  }

  return out;
};
