import Json from '@agacraft/classes/Json';
import uuid from '@agacraft/functions/uuid';
import getClass from '@agacraft/functions/getClass';

import Addon from '.';

import * as types from '../types';

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
  #Resource: { type?: string } = {};
  constructor(bp: BP, public type: T) {
    this.json = new Json(types.json[this.type]);
    this.BP = bp;
    this.BP.setFile(this as unknown as Files);

    this.type = type;
    this.#Resource.type = type;
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
    return `${this.BP.name.replaceAll(' ', '_')}:${this.name.replaceAll(
      ' ',
      '_'
    )}`;
  }
  toFile(): void {
    (this.toObject() as types.json['block'])[
      `minecraft:${this.type as 'block'}`
    ].description.identifier = this.getID();
    this.json.toFile(
      `${this.BP.path}/${
        // Se valida que no sean iguales para no causar conflictos con el RP
        this.BP.addon.path !== this.BP.path
          ? `${this.BP.path}/${this.BP.name}`
          : `${this.BP.path}/BP/${this.BP.name}`
      }/${this.#type}/${this.name}`
    );
  }
  setResource(property: 'type', value: string): this {
    this.#Resource[property] = value;
    return this;
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
  constructor(bp: BP, public name: string) {
    super(bp, 'item');
  }
  component<K extends keyof component['item']>(
    name: K,
    component: component['item'][K]
  ): this {
    this.toObject()['minecraft:item'].components[name] = component;
    if (name !== 'minecraft:wearable') return this;
    let slot = (component as component['item']['minecraft:wearable'])?.slot
      .split('.')
      .endItem() as 'head' | 'chest' | 'legs' | 'feet';
    if (
      slot === 'head' ||
      slot === 'chest' ||
      slot === 'legs' ||
      slot === 'feet'
    )
      this.setResource('type', getArmor(slot));

    return this;
  }
}
class Block extends BPJson<'block'> {
  constructor(bp: BP, public name: string) {
    super(bp, 'block');
  }
  component<K extends keyof component['block']>(
    name: K,
    component: component['block'][K]
  ): this {
    this.toObject()['minecraft:block'].components[name] = component;
    return this;
  }
}

type Files = [string, () => string | Buffer];

class BP {
  static Item = Item as unknown as Item;
  static Block = Block as unknown as Block;
  path: string;
  name: string;

  #files: Files[] = [];
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
    this.#files.push([
      'manifest.json',
      () =>
        `{ format_version: 2, header: { name: "${
          this.name
        }", description: "${description}", uuid: "${uuid()}", version: [1, 0, 0], min_engine_version: [1, 17, 0] }, modules: [ { type: 'data', uuid: "${uuid()}", version: [1, 0, 0] } ] }`,
    ]);
  }
  setFile(file: Files): this {
    this.#files.push(file);
    return this;
  }

  get _files(): Files[] {
    return this.#files;
  }
}

export = BP;
