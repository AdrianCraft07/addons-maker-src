import http from 'http';

import BP from './BP';
import RP from './RP';

let port = 3000;

type Dir = BP | RP;
export = class Addon {
  #dirs: Dir[] = [];
  #server = http.createServer().listen(port++);
  path: string;
  constructor(public name: string, config: {path: string} = {path: './'}) {
    this.name = name;
    this.path = `${config.path}/${name}`;
  }
  addDir(dir: Dir): this {
    this.#dirs.push(dir);
    return this
  }
  BP(description: string): BP {
    return new BP(this, description);
  }
  RP(description: string): RP {
    return new RP(this, description);
  }
  build(): void {
    this.#dirs.forEach(dir => dir.build());
    this.#server.close()
  }
};
