import Json from '@agacraft/classes/Json';
import uuid from '@agacraft/functions/uuid';
import HTTPRequest from '@agacraft/http/request';
import fs from 'fs';
import '@agacraft/Extension/Buffer';

import Addon from '.';
import BP from './BP';

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

class Item {
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
  addItem(Item: typeof BP.Item, config: itemConfig): this {
    Item.name = Item.name.replaceAll(' ', '_');
    this.#json.toObject().texture_data[Item.name] = {
      textures: `textures/items/${Item.name}`,
    };
    let texture = `https://raw.githubusercontent.com/AdrianCraft07/images/main/${config.type}.png`;
    this.#files.push([
      `textures/blocks/${Item.name}`,
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
    this.#json.toFile(`./${this.RP.addon.name}/RP/textures/item_texture`);
    this.#files.forEach(([path, data]) => {
      data.toFile(
        `./${this.RP.addon.name}/RP/${path}`,
        `./${this.RP.addon.name}/RP`
      );
    });
  }
}

class Block {
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
    this.#blocks.toFile(`./${this.RP.addon.name}/RP/blocks`);
    this.#terrain.toFile(`./${this.RP.addon.name}/RP/textures/terrain_texture`);
    this.#files.forEach(([path, data]) => {
      data.toFile(
        `./${this.RP.addon.name}/RP/${path}`,
        `./${this.RP.addon.name}/RP`
      );
    });
  }
}

class RP {
  addon: Addon;
  #files: Files[] = [];
  constructor(
    addon: Addon,
    public description: string = 'By Aga Addons-Maker \n@agacraft/addons-maker in npm'
  ) {
    this.addon = addon;
    this.description = description;
    addon.addDir(this);
    return this;
  }
  #getManifest(): Files {
    let json = new Json({
      format_version: 1,
      header: {
        name: this.addon.name,
        description: this.description,
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
    json.toFile = () => json._toFile(`./${this.addon.name}/RP/manifest`);

    return json;
  }
  static Item = Item as unknown as Item;
  Item(): Item {
    return new Item(this);
  }
  static Block = Block as unknown as Block;
  Block(): Block {
    return new Block(this);
  }
  setFile(file: Files): this {
    this.#files.push(file);
    return this;
  }
  build(): void {
    this.#files.push(this.#getManifest());
    this.#files.forEach(file => file.toFile());
  }
}
export = RP;
