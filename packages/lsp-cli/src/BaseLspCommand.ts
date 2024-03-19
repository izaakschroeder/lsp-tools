import { LspClient, createTransport } from '@izaakschroeder/lsp-client';
import { Command, Option } from 'clipanion';

/**
 * Base command that includes common LSP-related functionality and
 * arguments.
 */
export abstract class BaseLspCommand extends Command {
  connect = Option.String('--connect', { required: true });

  // TODO(@izaakschroeder): Determine how to implement this.
  // LSP can request configuration with a URI prefix or a section.
  // Perhaps this can point to a JSON file that mimics VSCode's
  // `settings.json` file or something.
  config = Option.String('--config');

  async createLspClient() {
    const { stdout } = this.context;
    const transport = createTransport(this.connect);
    const lsp = new LspClient();
    await lsp.connect(transport);

    lsp.on('window/logMessage', (log) => {
      stdout.write(`ℹ️  ${log.message}\n`);
    });

    // TODO(@izaakschroeder): Connect with `this.config` somehow.
    lsp.callback('workspace/configuration', ({ items }) => {
      return items.map(() => {
        return null;
      });
    });

    return lsp;
  }
}
