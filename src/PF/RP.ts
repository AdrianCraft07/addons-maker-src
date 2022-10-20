import Json from '@agacraft/classes/Json';
import uuid from '@agacraft/functions/uuid';
import HTTPRequest from '@agacraft/http/request';
import fs from 'fs';
import '@agacraft/Extension/Buffer';

import {Addon} from '.';
import * as BP from './BP';

type Files = Item | Block;

const attachables = (id: string, path: string, type: armor) => ({
  format_version: '1.8.0',
  'minecraft:attachable': {
    description: {
      identifier: id,
      materials: {
        default: 'armor',
        enchanted: 'armor_enchanted',
      },
      textures: {
        default: path,
        enchanted: 'textures/misc/enchanted_item_glint',
      },
      geometry: {
        default: `geometry.humanoid.armor.${type}`,
      },
      render_controllers: ['controller.render.armor'],
    },
  },
});

function ImageTexture(path: string): Promise<Buffer> {
  let isURL = path.startsWith('http://') || path.startsWith('https://');
  return isURL
    ? HTTPRequest(path).then(r => r.buffer())
    : new Promise((resolve, reject) => {
        resolve(fs.readFileSync(path));
      });
}

type armor = 'helmet' | 'chestplate' | 'leggings' | 'boots';
type tool = 'sword' | 'pickaxe' | 'axe' | 'shovel' | 'hoe';
type itemConfig = {
  texture?: string;
  type: armor | tool | 'item';
};

type json = {
  blocks: {
    textures:
      | string
      | {
          up: string;
          down: string;
          north: string;
          south: string;
          west: string;
          east: string;
          side: string;
        };
    isotropic?:
      | boolean
      | {
          up: boolean;
          down: boolean;
          north: boolean;
          south: boolean;
          west: boolean;
          east: boolean;
          side: boolean;
        };
    sound?:
      | 'stone'
      | 'deepslate'
      | 'metal'
      | 'wood'
      | 'grass'
      | 'gravel'
      | 'sand'
      | 'cloth'
      | 'brick'
      | 'snow'
      | 'glass'
      | 'anvil'
      | 'slime';
  };
  terrain: {
    textures: string | { path: string; overlay_color: string }[];
  };
};

export class Item {
  #json = new Json({
    resource_pack_name: 'AgaMaker',
    texture_name: 'atlas.items',
    texture_data: {},
  } as {
    resource_pack_name: 'AgaMaker';
    texture_name: 'atlas.items';
    texture_data: { [key: string]: { textures: string } };
  });
  #files: [string, Buffer | { toFile(path: string, rpath: string): void }][] =
    [];
  constructor(public RP: RP) {
    this.RP = RP;
    this.RP.setFile(this);
  }
  addItem(Item: BP.Item, config: itemConfig): this {
    const name = Item.name.replaceAll(' ', '_');
    this.#json.toObject().texture_data[name] = {
      textures: `textures/items/${name}`,
    };
    let texture = `https://raw.githubusercontent.com/AdrianCraft07/images/main/${config.type}.png`;

    if (
      config.type == 'helmet' ||
      config.type == 'chestplate' ||
      config.type == 'leggings' ||
      config.type == 'boots'
    ) {
      this.#files.push([
        `textures/models/armor/${name}`,
        { toFile(path, rpath) {
          new Json(attachables(name, path, config.type as armor)).toFile(`${rpath}/attachables/${name}`);
        } },
      ]);
    }
    this.#files.push([
      `textures/items/${name}`,
      {
        toFile(path, rpath) {
          ImageTexture(config.texture || texture).then(res =>
            res.toFile(path + '.png')
          );
        },
      },
    ]);
    return this;
  }
  toFile(): void {
    this.#json.toFile(`./${this.RP.addon.path}/RP/textures/item_texture`);
    this.#files.forEach(([path, data]) => {
      data.toFile(
        `./${this.RP.addon.path}/RP/${path}`,
        `./${this.RP.addon.path}/RP`
      );
    });
  }
}

export class Block {
  #blocks = new Json({
    format_version: '1.1.0',
  } as {
    format_version: '1.1.0';
    [key: string]: json['blocks'] | '1.1.0';
  });
  #terrain = new Json({
    padding: 8,
    resource_pack_name: 'AgaMaker',
    num_mip_levels: 4,
    texture_name: 'atlas.terrain',
    texture_data: {},
  });
  #files: [string, Buffer | { toFile(path: string, rpath: string): void }][] =
    [];
  constructor(public RP: RP) {
    this.RP = RP;
    this.RP.setFile(this);
  }
  toFile(): void {
    this.#blocks.toFile(`./${this.RP.addon.path}/RP/blocks`);
    this.#terrain.toFile(`./${this.RP.addon.path}/RP/textures/terrain_texture`);
    this.#files.forEach(([path, data]) => {
      data.toFile(
        `./${this.RP.addon.path}/RP/${path}`,
        `./${this.RP.addon.path}/RP`
      );
    });
  }
}


export interface RP {
  addon: Addon;
  name: string;
  description: string;
  path: string;
  type: 'RP',
  setFile(file: Files): void;
  Item(): Item;
  Block(): Block;
  _build(): void;
};

export function createRP(addon: Addon, name: string, description: string, path: string= './RP'): RP {
  const privaterp ={
    files: [] as Files[],
    getManifest(): Files {
      let json = new Json({
        format_version: 1,
        header: {
          name: rp.name,
          description: rp.description,
          uuid: uuid(),
          version: [1, 0, 0],
          min_engine_version: [1, 16, 100],
        },
        modules: [
          {
            type: 'resources',
            uuid: uuid(),
            version: [1, 0, 0],
          },
        ],
      }) as unknown as Files & { _toFile: (arg: string) => void };
      json._toFile = json.toFile;
      json.toFile = () => json._toFile(`${rp.path}/manifest`);
  
      return json;
    }
  }
  const rp: RP = {
    addon,
    name,
    description,
    path,
    type: 'RP',
    Item(): Item {
      return new Item(rp);
    },
    Block(): Block {
      return new Block(rp);
    },
    setFile(file: Files): RP {
      privaterp.files.push(file);
      return rp;
    },
    _build(): any[] {
      privaterp.files.push(privaterp.getManifest());
      return privaterp.files.map(file => file.toFile());
    }
  }
  addon.addDir(rp);
  return rp;
}
createRP.build = (rp:RP) => rp._build();
