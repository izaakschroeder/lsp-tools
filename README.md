# @izaakschroeder/lsp-tools

Tools to work with your LSP.

```sh
lsp \
  --connect 'stdio://biome/?arg=lsp-proxy' \
  fix \
  --ignore '**/node_modules/**' \
  --rule 'quickfix.suppressRule.biome.*' \
  './src/**/*{.ts,.tsx,.js,.jsx,.mjs,.cjs}'
```