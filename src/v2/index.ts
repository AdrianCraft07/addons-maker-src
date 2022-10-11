import http from 'http';
import getClass from '@agacraft/functions/getClass';

import { BP, createBP } from './BP';
import { RP, createRP } from './RP';

const builders = {
  BP: createBP.build,
  RP: createRP.build,
};

function createServer() {
  return http.createServer().listen(0);
}
type Dir = BP | RP;

export interface Addon {
  path: {
    BP: string;
    RP: string;
  };
  addDir(dir: Dir): Addon;
  BP(name: string, description: string): BP;
  RP(name: string, description: string): RP;
  _build(): void;
}

export function createAddon(path: { BP: string; RP: string }): Addon {
  const privateaddon = {
    dirs: [] as Dir[],
    server: createServer(),
  };
  const addon: Addon = {
    path,
    addDir(dir: Dir): Addon {
      privateaddon.dirs.push(dir);
      return addon;
    },
    BP(name: string, description: string): BP {
      return createBP(addon, name, description, path.BP);
    },
    RP(name: string, description: string): RP {
      return createRP(addon, name, description, path.RP);
    },
    _build(): void {
      privateaddon.dirs.forEach(dir => {
        builders[dir.type as 'BP'](dir as BP);
      });
      privateaddon.server.close();
    },
  };
  return addon;
}
createAddon.build = (addon: Addon) => {
  addon._build();
};
