import * as os from 'node:os';
import { basename, resolve } from 'node:path';
import type { WriteStream } from 'node:tty';
import { pathToFileURL } from 'node:url';
import { Chalk, type ChalkInstance } from 'chalk';
import { Option } from 'clipanion';
import { Bar, BarItem, Progress, TerminalTty } from 'ku-progress-bar';
import createThroat from 'throat';
import * as t from 'typanion';

import { BaseLspCommand } from './BaseLspCommand';
import { createActionFilter } from './createActionFilter';
import { createActionRewrite } from './createActionRewrite';
import { fixFile } from './fixFile';
import { glob } from './glob';

const formatServerInfo = (
  chalk: ChalkInstance,
  serverInfo: { name: string; version?: string | undefined } | null | undefined,
) => {
  if (!serverInfo) {
    return chalk.red('(no server info)');
  }
  const parts = [chalk.white(serverInfo.name)];
  if (serverInfo.version) {
    parts.push('version:', chalk.green(serverInfo.version));
  }
  return parts.join(' ');
};

export class FixCommand extends BaseLspCommand {
  static paths = [['fix'], ['f']];

  parallel = Option.String('--parallel,-j', `${os.cpus().length}`, {
    validator: t.isNumber(),
    description: `
      How many tasks to run in parallel.
    `,
  });
  ignore = Option.Array('--ignore', {
    description: `
      Glob pattern of files to ignore. Can be specified more than once
      to ignore multiple patterns.
    `,
  });
  actionKinds = Option.Array('--action-kind', {
    description: `
      Dot-delimited pattern of actions to perform. Pattern can include
      the values \`*\` and \`**\` which work like their glob versions.
      Can be specified more than once to include multiple patterns.
    `,
  });
  actionTextReplace = Option.Array('--action-text-replace', {
    description: `
      Pass a \`needle=haystack\` search/replace string to modify the
      result after an action has been performed but before it has been
      applied to your files.
    `,
  });
  actionIgnoreDuplicates = Option.Boolean('--action-ignore-duplicates', {
    description: `
      If multiple actions are presented that do the same thing, ignore
      all but one of them.
    `,
  });

  // TODO(@izaakschroeder): Move this to `BaseLspCommand`
  // TODO(@izaakschroeder): Do feature detection for workspaces.
  workspace = Option.Array('--workspace', [process.cwd()], {
    description: `
      The workspace root directory. Can be specified more than once to
      operate on multiple workspaces, although your LSP server needs to
      support this feature as well.
    `,
  });

  include = Option.Rest({ required: 1 });

  async execute() {
    const lsp = await this.createLspClient();
    const chalk = new Chalk();

    // TODO(@izaakschroeder): Move this to `BaseLspCommand`
    const workspaceFolders = this.workspace.map((val) => {
      const root = resolve(val);
      return {
        name: 'workspace',
        path: root,
        uri: pathToFileURL(root).href,
      };
    });

    const { stdout } = this.context;

    stdout.write(
      `🚀 Connecting to LSP ${chalk.blueBright(this.connect)} ...\n`,
    );

    const initializeResult = await lsp.request('initialize', {
      processId: process.pid,
      capabilities: {
        general: {
          positionEncodings: ['utf-8'],
        },
        textDocument: {
          codeAction: {
            dynamicRegistration: true,
          },
          synchronization: {
            didSave: true,
            dynamicRegistration: true,
          },
        },
        workspace: {
          configuration: true,
          didChangeConfiguration: { dynamicRegistration: true },
          workspaceFolders: true,
        },
      },
      workspaceFolders,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      rootUri: workspaceFolders[0]!.uri,
    });

    const info = formatServerInfo(chalk, initializeResult.serverInfo);
    stdout.write(`⚡️ Connected to LSP: ${info}.\n`);
    lsp.notify('initialized', {});

    const actionFilter = createActionFilter(this.actionKinds);
    let actionMap = null;
    if (this.actionTextReplace) {
      actionMap = createActionRewrite(this.actionTextReplace);
    }
    const fixOptions = {
      actionFilter,
      actionMap,
      ignoreDuplicateActions: this.actionIgnoreDuplicates,
    };

    const exec = createThroat(this.parallel, async (path) => {
      return await fixFile(lsp, path, fixOptions);
    });

    const progress = new Progress({ total: 1 }, { file: '<none>' });
    const bar = new Bar(new TerminalTty(stdout as WriteStream));
    bar.add(
      // TODO(@izaakschroeder): Figure this one out
      // @ts-expect-error
      new BarItem(progress, {
        template:
          '[{bar}] {percentage} eta: {eta} elapsed: {duration} {value}/{total} – {file}',
      }),
    );
    const interval = setInterval(() => bar.render(), 50);

    let total = 0;
    for (const workspace of workspaceFolders) {
      await glob(
        workspace.path,
        { ignore: this.ignore, include: this.include },
        async (path) => {
          progress.setTotal(++total);
          await exec(path);
          progress.increment(1, { file: basename(path) });
        },
      );
    }

    clearInterval(interval);
    bar.clean();

    stdout.write('🧹 Shutting down language server...\n');
    await lsp.request('shutdown');
    lsp.notify('exit');
    stdout.write('✨ Done.\n');
  }
}
