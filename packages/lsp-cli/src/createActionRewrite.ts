import type { CodeActionItem } from '@izaakschroeder/lsp-client';

export const createActionRewrite = (patterns: string[]) => {
  const rewrites = patterns.map((patterns) => {
    const [find, replace] = patterns.split('=', 2);
    if (!find || !replace) {
      throw new Error();
    }
    return (action: CodeActionItem) => {
      for (const key in action.edit.changes) {
        const changes = action.edit.changes[key];
        if (!changes) {
          continue;
        }
        for (const change of changes) {
          change.newText = change.newText.replaceAll(find, replace);
        }
      }
      return action;
    };
  });
  return (action: CodeActionItem) => {
    return rewrites.reduce((prev, cur) => {
      return cur(prev);
    }, action);
  };
};
