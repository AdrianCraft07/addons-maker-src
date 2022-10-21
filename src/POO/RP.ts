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
class RPItem {
  constructor(public RP: RP) {
    this.RP = RP;
  }
}
class RPBlock {
  constructor(public RP: RP) {
    this.RP = RP;
  }
}
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
  #json : {
    resource_pack_name: 'AgaMaker';
    texture_name: 'atlas.items';
    texture_data: { [key: string]: { textures: string } };
  }={
    resource_pack_name: 'AgaMaker',
    texture_name: 'atlas.items',
    texture_data: {},
  } ;
  #files: [string, Buffer | { toFile(path: string, rpath: string): void }][] =
    [];
  constructor(public RP: RP) {
    this.RP = RP;
  }
  addItem(Item: typeof BP.Item, config: itemConfig): this {
    let name = Item.name.replaceAll(' ', '_');
    this.#json.texture_data[Item.name] = {
      textures: `textures/items/${Item.name}`,
    };
    let texture = `https://raw.githubusercontent.com/AdrianCraft07/images/main/${config.type}.png`;

    if (
      config.type == 'helmet' ||
      config.type == 'chestplate' ||
      config.type == 'leggings' ||
      config.type == 'boots'
    ) {
      const x = config.type == 'leggings' ? 2 : 1;
      let path = `textures/models/armor/${name}_${x}.png`
      this.RP.setFile([`attachables/${name}.json`,()=>
        attachables(name, path, config.type as armor)._toString()
      ])
      ImageTexture(path).then(res =>
        this.RP.setFile([path, ()=> res])
      )
    }
    ImageTexture(config.texture || texture).then(res =>
      this.RP.setFile([`textures/items/${name}`, ()=> res])
    )
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

class Block {
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
    this.RP = RP;
    this.RP.setFile(['blocks.json', () => this.#blocks._toString()]);
    this.RP.setFile([
      'textures/terrain_texture.json',
      () => this.#terrain._toString(),
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

type RPFiles = [string, () => string | Buffer];

class RP {
  static Item = RPItem as unknown as RPItem;
  static Block = RPBlock as unknown as RPBlock;
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
      () =>
        `{ format_version: 2, header: { name: "${
          this.name
        }", description: "${description}", uuid: "${uuid()}", version: [1, 0, 0], min_engine_version: [1, 17, 0] }, modules: [ { type: 'data', uuid: "${uuid()}", version: [1, 0, 0] } ] }`,
    ]);
  }
  setFile(file: RPFiles): this {
    this.#files.push([
      `${this.path}/${
        // Se valida que no sean iguales para no causar conflictos con el BP
        this.addon.onlypath
          ? `${this.path}/RP/${this.name}`
          : `${this.path}/${this.name}`
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
