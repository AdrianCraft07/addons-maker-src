import BP from './BP';
import RP from './RP';
import { file } from '@agacraft/fs';

type Dir = BP | RP;
class Addon {
  #dirs: Dir[] = [];
  path: { BP: string; RP: string };
  onlypath = false;
  constructor(
    public name: string,
    config: { path: string | { BP: string; RP: string } } = { path: './' }
  ) {
    this.name = name;
    this.path = config.path as { BP: string; RP: string };
    if (typeof this.path === 'string') {
      this.onlypath = true;
      this.path = { BP: this.path, RP: this.path };
    }
  }
  BP(config: { description?: string } = {}) {
    return new BP(this, {
      description: config.description,
      path: this.path.BP,
      name: this.name,
    });
  }
  RP(config: { description?: string } = {}): RP {
    return new RP(this, {
      description: config.description,
      path: this.path.RP,
      name: this.name,
    });
  }
  addDir(dir: Dir): this {
    this.#dirs.push(dir);
    return this;
  }
  get dirs() {
    return this.#dirs;
  }
  static build(addon: Addon): void {
    const files: [string, () => string | Buffer][] = [];
    addon.dirs.forEach(dir => {
      files.push(...dir._files);
    });
    files.forEach(([path, content]) => {
      file(path, content());
    });
  }
}
export = Addon;
