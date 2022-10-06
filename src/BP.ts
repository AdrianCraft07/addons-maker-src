import Json from '@agacraft/classes/Json';
import uuid from '@agacraft/functions/uuid';
import getClass from '@agacraft/functions/getClass';

import Addon from '.';

import * as types from './types';

interface component {
  block: types.ComponentsBlock;
  item: types.ComponentsItem;
  entity: types.ComponentsEntity;
}

class BPJson<T extends keyof types.json> {
  #type;
  BP: BP = null as unknown as BP;
  json;
  name: any;
  constructor(bp: BP, public type: T) {
    this.json = new Json(types.json[this.type]);
    this.BP = bp;
    this.BP.setFile(this as unknown as Files);

    this.type = type;
    this.#type = type === 'entity' ? 'entities' : type + 's';
  }
  toObject(): types.json[T] {
    return this.json.toObject() as unknown as types.json[T];
  }
  copy(bp: BP): Files {
    let File = getClass(this);
    let file = new File(bp, this.type);
    file.name = this.name;
    file.json = this.json.copy();
    return file;
  }
  getID() {
    return `${this.BP.addon.name.replaceAll(' ', '_')}:${this.name.replaceAll(
      ' ',
      '_'
    )}`;
  }
  toFile(): void {
    (this.toObject() as types.json['block'])[
      `minecraft:${this.type as 'block'}`
    ].description.identifier = this.getID();
    this.json.toFile(`./${this.BP.addon.path}/BP/${this.#type}/${this.name}`);
  }
}

function getArmor(slot: 'head' | 'chest' | 'legs' | 'feet') {
  return {
    head: 'helmet',
    chest: 'chestplate',
    legs: 'leggings',
    feet: 'boots',
  }[slot];
}

class Item extends BPJson<'item'> {
  #Resource: { type?: string } = {};
  constructor(bp: BP, public name: string) {
    super(bp, 'item');
  }
  component<K extends keyof component['item']>(
    name: K,
    component: component['item'][K]
  ): this {
    this.toObject()['minecraft:item'].components[name] = component;
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
        this.#Resource.type = getArmor(slot);
      }
    }
    return this;
  }
  getResource() {
    return this.#Resource;
  }
}
class Block extends BPJson<'block'> {
  constructor(bp: BP, public name: string) {
    super(bp, 'block');
    this.name = name;
  }
  component<K extends keyof component['block']>(
    name: K,
    component: component['block'][K]
  ): this {
    this.toObject()['minecraft:block'].components[name] = component;
    return this;
  }
}

type Files = Item | Block;

class BP {
  static Item = Item as unknown as Item;
  static Block = Block as unknown as Block;
  #files: Files[] = [];
  constructor(
    public addon: Addon,
    public description: string = 'By Aga Addons-Maker \n@agacraft/addons-maker in npm'
  ) {
    this.addon = addon;
    this.description = description;
    addon.addDir(this);
  }
  Block(name: string): Block {
    return new Block(this, name);
  }
  Item(name: string): Item {
    return new Item(this, name);
  }
  copy(addon: Addon): BP {
    const bp = new BP(addon, this.description);
    this.#files.forEach(file => bp.setFile(file.copy(bp)));
    return bp;
  }
  #getManifest(): Files {
    let json = new Json({
      format_version: 2,
      header: {
        name: this.addon.name,
        description: this.description,
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
    }) as unknown as Files & { _toFile: (arg: string) => void };
    json._toFile = json.toFile;
    json.toFile = () => json._toFile(`./${this.addon.path}/BP/manifest`);

    return json;
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

export = BP;
