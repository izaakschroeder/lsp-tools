import * as fs from 'node:fs/promises';
import { join } from 'node:path';
import picomatch from 'picomatch';

interface GlobOptions {
  ignore?: string | string[] | undefined | null;
  include?: string | string[] | undefined | null;
}

export const glob = async (
  root: string,
  options: GlobOptions,
  cb: (path: string) => Promise<void>,
) => {
  const { ignore, include } = options;
  const isIgnored = ignore ? picomatch(ignore) : () => false;
  const isIncluded = include ? picomatch(include) : () => true;

  const processDir = async (root: string, dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const path = join(dir, entry.name);
        const relativePath = path.substring(root.length);
        if (isIgnored(relativePath)) {
          return;
        }
        if (entry.isDirectory()) {
          return await processDir(root, path);
        }
        if (!isIncluded(path)) {
          return;
        }
        if (entry.isFile()) {
          await cb(path);
          return;
        }
      }),
    );
  };

  return await processDir(root, root);
};
