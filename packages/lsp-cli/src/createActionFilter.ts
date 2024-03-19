import type { CodeActionItem } from '@izaakschroeder/lsp-client';

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const patternToRegExp = (str: string) => {
  const parts = str.match(/(\\.|[^.])+/g);
  if (!parts) {
    return null;
  }
  return new RegExp(
    parts
      .map((part, i, arr) => {
        const eof = i === arr.length - 1;
        if (part === '*') {
          return `[^.]+${eof ? '$' : '\\.'}`;
        }
        if (part === '**') {
          return `([^.]+\.)*${eof ? '[^.]*$' : ''}`;
        }
        return `${escapeRegExp(part)}${eof ? '$' : '\\.'}`;
      })
      .join(''),
  );
};

export const createActionFilter = (
  pattern: string | string[] | null | undefined,
) => {
  if (typeof pattern === 'string') {
    const regex = patternToRegExp(pattern);
    if (!regex) {
      return null;
    }
    return (action: CodeActionItem) => regex.test(action.kind);
  }
  if (Array.isArray(pattern)) {
    const regexes = pattern.map(patternToRegExp).filter(Boolean) as RegExp[];
    return (action: CodeActionItem) => {
      return regexes.some((regex) => regex.test(action.kind));
    };
  }
  return null;
};
