# @izaakschroeder/lsp-cli

## Commands

### `fix`

Use the LSP `textDocument/codeAction` to perform specific actions on files.

```sh
lsp fix --connect "stdio://$(yarn bin biome)/?arg=lsp-proxy" \
  --ignore '**/node_modules/**' \
  --action-kind 'quickfix.suppressRule.biome.**' \
  '**/*{.ts,.tsx,.js,.jsx,.mjs,.cjs}'
```
