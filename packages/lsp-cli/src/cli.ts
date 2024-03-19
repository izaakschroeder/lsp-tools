import { Cli } from 'clipanion';
import { FixCommand } from './FixCommand';

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: 'lsp-tools',
  binaryName: `${node} ${app}`,
  binaryVersion: '1.0.0',
});

cli.register(FixCommand);
cli.runExit(args);
