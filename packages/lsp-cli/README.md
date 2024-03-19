# @izaakschroeder/lsp-cli

## Commands

### `fix`

Use the LSP `textDocument/codeAction` to perform specific actions on files.

```sh
lsp fix --connect 'stdio://biome/?arg=lsp-proxy' \
  --ignore '**/node_modules/**' \
  --action-kind 'quickfix.suppressRule.biome.*' \
  './src/**/*{.ts,.tsx,.js,.jsx,.mjs,.cjs}'
```