import BP from './BP';
import RP from './RP';

type Dir = BP | RP;
export default class Addon {
  #dirs: Dir[] = [];
  path: string | { BP: string; RP: string };
  constructor(
    public name: string,
    config: { path: string | { BP: string; RP: string } } = { path: './' }
  ) {
    this.name = name;
    this.path = config.path;
  }
  addDir(dir: Dir): this {
    this.#dirs.push(dir);
    return this;
  }
  static build(addon: Addon): void {}
}
