import Json from '@agacraft/classes/Json';
import uuid from '@agacraft/functions/uuid';
import { file } from '@agacraft/fs';

import { Addon } from '.';

import * as types from '../types';

type getFile = { path: string; data: string };

interface component {
  block: types.ComponentsBlock;
  item: types.ComponentsItem;
  entity: types.ComponentsEntity;
}

const clsses = {
  item: createItem,
  block: createBlock,
};

interface BPJson<T extends keyof types.json> {
  BP: BP;
  json: Json<types.json[T]>;
  type: T;
  name: string;
  toObject(): types.json[T];
  copy(bp: BP): Files;
  getID(): any;
  getFile(): getFile;
}

function createBPJson<T extends keyof types.json>(BP: BP, type: T): BPJson<T> {
  const directory = type === 'entity' ? 'entities' : type + 's';
  let bpjson: BPJson<T> = {
    BP,
    json: new Json(types.json[type]),
    type,
    name: '',
    toObject(): types.json[T] {
      return bpjson.json.toObject();
    },
    copy(bp: BP): Files {
      let file = clsses[type as 'item'](bp, type) as unknown as Item;
      file.name = bpjson.name;
      file.json = bpjson.json.copy() as unknown as Json<types.json['item']>;
      return file;
    },
    getID() {
      return (bpjson.toObject() as types.json['item'])[
        `minecraft:${type as 'item'}`
      ].description.identifier;
    },
    getFile(): getFile {
      return {
        path: `${bpjson.BP.path}/${bpjson.BP.name}/${directory}/${bpjson.name}.json`,
        data: bpjson.json.toString(),
      };
    },
  };
  BP.setFile(bpjson as unknown as Files);
  return bpjson;
}

function getArmor(slot: 'head' | 'chest' | 'legs' | 'feet') {
  return {
    head: 'helmet',
    chest: 'chestplate',
    legs: 'leggings',
    feet: 'boots',
  }[slot];
}

export interface Item extends BPJson<'item'> {
  component: <K extends keyof component['item']>(
    name: K,
    component: component['item'][K]
  ) => Item;
  name: string;
  getResource(): { type?: string };
}

function createItem(bp: BP, name: string): Item {
  let resource = {};
  let item = createBPJson(bp, 'item') as unknown as Item;
  item.name = name;
  item.json.toObject()[
    'minecraft:item'
  ].description.identifier = `${bp.name.replace(' ', '_')}:${name.replace(
    ' ',
    '_'
  )}`;
  item.getResource = () => resource;
  item.component = <K extends keyof component['item']>(
    name: K,
    component: component['item'][K]
  ) => {
    item.toObject()['minecraft:item'].components[name] = component;
    if (name === 'minecraft:wearable') {
      let slot = (component as component['item']['minecraft:wearable'])?.slot
        .split('.')
        .endItem() as 'head' | 'chest' | 'legs' | 'feet';
      if (
        slot === 'head' ||
        slot === 'chest' ||
        slot === 'legs' ||
        slot === 'feet'
      ) {
        item.getResource().type = getArmor(slot);
      }
    }
    return item;
  };
  return item;
}

export interface Block extends BPJson<'block'> {
  name: string;
  component<K extends keyof component['block']>(
    name: K,
    component: component['block'][K]
  ): Block;
}
function createBlock(bp: BP, name: string): Block {
  let block = createBPJson(bp, 'block') as unknown as Block;
  block.name = name;
  block.json.toObject()[
    'minecraft:block'
  ].description.identifier = `${bp.name.replace(' ', '_')}:${name.replace(
    ' ',
    '_'
  )}`;
  block.component = <K extends keyof component['block']>(
    name: K,
    component: component['block'][K]
  ) => {
    block.toObject()['minecraft:block'].components[name] = component;
    return block;
  };
  return block;
}

type Files = Item | Block;
export type BP = {
  addon: Addon;
  name: string;
  type: 'BP';
  description: string;
  path: string;
  setFile(file: Files): void;
  Block(name: string): Block;
  Item(name: string): Item;
  copyTo(newBP: BP): void;
  _build(): getFile[];
};

export function createBP(
  addon: Addon,
  name: string,
  description: string,
  path: string = './BP'
) {
  const privatebp = {
    getManifest(): Files {
      let json = new Json({
        format_version: 2,
        header: {
          name: bp.name,
          description: bp.description,
          uuid: uuid(),
          version: [1, 0, 0],
          min_engine_version: [1, 17, 0],
        },
        modules: [
          {
            type: 'data',
            uuid: uuid(),
            version: [1, 0, 0],
          },
        ],
      });
      return {
        getFile() {
          return {
            path: `${bp.path}/${bp.name}/manifest.json`,
            data: json.toString(),
          };
        },
      } as unknown as Files;
    },
    files: [] as Files[],
  };
  const bp: BP = {
    addon,
    name,
    description,
    path,
    type: 'BP',
    setFile(file: Files): void {
      privatebp.files.push(file);
    },
    Block(name: string): Block {
      return createBlock(bp, name);
    },
    Item(name: string): Item {
      return createItem(bp, name);
    },
    copyTo(newBP: BP): void {
      privatebp.files.forEach(file => {
        newBP.setFile(file.copy(newBP));
      });
    },
    _build(): getFile[] {
      privatebp.files.push(privatebp.getManifest());
      return privatebp.files.map(file => file.getFile());
    },
  };
  addon.addDir(bp);
  return bp;
}
createBP.build = (bp: BP) => {
  bp._build().map(dataFile => {
    file(dataFile.path, dataFile.data);
  });
};
