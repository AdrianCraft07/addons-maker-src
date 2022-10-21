import Addon from '.';
import BP from './BP';
import uuid from '@agacraft/functions/uuid';
import HTTPRequest from '@agacraft/http/request';
import fs from 'fs';

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

class RPItem {
  #json: {
    resource_pack_name: 'AgaMaker';
    texture_name: 'atlas.items';
    texture_data: { [key: string]: { textures: string } };
  } = {
    resource_pack_name: 'AgaMaker',
    texture_name: 'atlas.items',
    texture_data: {},
  };
  #files: [string, () => Buffer | string][] = [];
  constructor(public RP: RP) {
    this.RP.setFile(['textures/item_texture.json', new Promise(resolve=>resolve(() => this.#json._toString()))]);
  }
  addItem(Item: typeof BP.Item, config: itemConfig = { type: 'axe' }): this {
    let name = Item.name.replaceAll(' ', '_');
    this.#json.texture_data[name] = {
      textures: `textures/items/${name}`,
    };
    let texture = `https://raw.githubusercontent.com/AdrianCraft07/images/main/${config.type}.png`;

    if (
      config.type == 'helmet' ||
      config.type == 'chestplate' ||
      config.type == 'leggings' ||
      config.type == 'boots'
    ) {
      const x = config.type == 'leggings' ? 2 : 1;
      let path = `textures/models/armor/${name}_${x}.png`;
      this.RP.setFile([
        `attachables/${name}.json`,
        new Promise(resolve=>resolve(() => attachables(name, path, config.type as armor)._toString())),
      ]);
      this.RP.setFile([path, ImageTexture(path).then(res => () => res)]);
    }
    this.RP.setFile([`textures/items/${name}.png`, ImageTexture(config.texture || texture).then(res => ()=>res)])
    return this;
  }
}

type model = {
  up: boolean;
  down: boolean;
  north: boolean;
  south: boolean;
  west: boolean;
  east: boolean;
  side: boolean;
};

class RPBlock {
  #blocks: {
    format_version: '1.1.0';
    [key: string]: json['blocks'] | '1.1.0';
  } = {
    format_version: '1.1.0',
  };
  #terrain: {
    padding: 8;
    resource_pack_name: 'AgaMaker';
    num_mip_levels: 4;
    texture_name: 'atlas.terrain';
    texture_data: { [key: string]: json['terrain'] };
  } = {
    padding: 8,
    resource_pack_name: 'AgaMaker',
    num_mip_levels: 4,
    texture_name: 'atlas.terrain',
    texture_data: {},
  };
  #files: RPFiles[] = [];
  constructor(public RP: RP) {
    this.RP.setFile(['blocks.json', new Promise(resolve=>resolve(() => this.#blocks._toString()))]);
    this.RP.setFile([
      'textures/terrain_texture.json',
      new Promise(resolve=>resolve(() => this.#terrain._toString())),
    ]);
  }
  addBlock(
    Block: typeof BP.__Block,
    config: {
      textures?: model;
      isotropic?: model;
      sound?: json['blocks']['sound'];
    }
  ): this {
    let name = Block.name.replaceAll(' ', '_');
    let data: json['blocks'] = {
      textures: name,
      sound: config.sound || 'stone',
    };
    if (config.textures) {
      data.textures = {
        up: config.textures.up ? `${name}_up` : name,
        down: config.textures.down ? `${name}_down` : name,
        north: config.textures.north ? `${name}_north` : name,
        south: config.textures.south ? `${name}_south` : name,
        west: config.textures.west ? `${name}_west` : name,
        east: config.textures.east ? `${name}_east` : name,
        side: config.textures.side ? `${name}_side` : name,
      };
      ['up', 'down', 'north', 'south', 'west', 'east', 'side'].forEach(key => {
        let value = (data.textures as { [key: string]: string })[key];
        this.#terrain.texture_data[value] = {
          textures: value,
        };
      });
    }
    if (config.isotropic) {
      data.isotropic = {
        up: config.isotropic.up,
        down: config.isotropic.down,
        north: config.isotropic.north,
        south: config.isotropic.south,
        west: config.isotropic.west,
        east: config.isotropic.east,
        side: config.isotropic.side,
      };
    }
    this.#blocks[Block.getID()] = data;
    return this;
  }
}

type RPFiles = [string, Promise<()=> string | Buffer>];

class RP {
  static Item = RPItem;
  static Block = RPBlock;
  static __Item = {} as RPItem;
  static __Block = {} as RPBlock;
  path: string;
  name: string;

  #files: RPFiles[] = [];
  constructor(
    public addon: Addon,
    {
      path,
      name,
      description,
    }: { path?: string; name?: string; description?: string }
  ) {
    this.path = path || './';
    this.name = name || 'My BP';
    description ||= 'By Aga Addons-Maker \n@agacraft/addons-maker in npm';
    addon.addDir(this);
    this.setFile([
      'manifest.json',
      new Promise((resolve)=>resolve(() =>
      ({
        format_version: 2,
        header: {
          name: this.name,
          description,
          uuid: uuid(),
          version: [1, 0, 0],
          min_engine_version: [1, 17, 0],
        },
        modules: [
          { type: 'resources', uuid: uuid(), version: [1, 0, 0] },
        ],
      }._toString()))),
    ]);
  }
  Item() {
    return new RPItem(this);
  }
  Block() {
    return new RPBlock(this);
  }
  setFile(file: RPFiles): this {
    this.#files.push([
      `${this.path}/${
        // Se valida que no sean iguales para no causar conflictos con el BP
        this.addon.onlypath ? `RP/${this.name}` : `${this.name}`
      }/${file[0]}`,
      file[1],
    ]);
    return this;
  }

  get _files(): RPFiles[] {
    return this.#files;
  }
}

export = RP;
