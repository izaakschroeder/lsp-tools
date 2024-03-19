import type { Range } from '@izaakschroeder/lsp-client';

export const rangesOverlap = (a: Range, b: Range): boolean => {
  const startLine = Math.max(a.start.line, b.start.line);
  const endLine = Math.min(a.end.line, b.end.line);
  if (endLine > startLine) {
    return true;
  }
  if (startLine === endLine) {
    const startCharacter = Math.max(a.start.character, b.start.character);
    const endCharacter = Math.min(a.end.character, b.end.character);
    return endCharacter > startCharacter;
  }
  return false;
};
