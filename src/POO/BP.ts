import uuid from '@agacraft/functions/uuid';
import getClass from '@agacraft/functions/getClass';
import '@agacraft/extension/Object';

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
  #Resource: { type?: string } = {};
  constructor(bp: BP, public type: T, public name: string) {
    this.type = type;
    this.#Resource.type = type;
    this.#type = type === 'entity' ? 'entities' : type + 's';
    this.json = types.json[this.type];
    this.BP = bp;
    this.BP.setFile([
      `${this.#type}/${this.name}.json`,
      new Promise(resolve => resolve(() => this.json._toString())),
    ]);
    (this.json as types.json['item'])[
      `minecraft:${this.type}` as 'minecraft:item'
    ].description.identifier = this.getID();
  }
  toObject(): types.json[T] {
    return this.json;
  }
  copy(bp: BP): BPFiles {
    let File = getClass(this);
    let file = new File(bp, this.type);
    file.name = this.name;
    file.json = this.json;
    return file;
  }
  getID() {
    return `${this.BP.name.replaceAll(' ', '_')}:${this.name.replaceAll(
      ' ',
      '_'
    )}`;
  }
  setResource(property: 'type', value: string): this {
    this.#Resource[property] = value;
    return this;
  }
  get Resource() {
    return this.#Resource;
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

class BPItem extends BPJson<'item'> {
  constructor(bp: BP, name: string) {
    super(bp, 'item', name);
    this.component('minecraft:icon', {texture: name.replaceAll(' ', '_')})
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
class BPBlock extends BPJson<'block'> {
  constructor(bp: BP, name: string) {
    super(bp, 'block', name);
  }
  component<K extends keyof component['block']>(
    name: K,
    component: component['block'][K]
  ): this {
    this.toObject()['minecraft:block'].components[name] = component;
    return this;
  }
}

type BPFiles = [string, Promise<() => string | Buffer>];

class BP {
  static Block = BPBlock;
  static Item = BPItem;
  static __Block = {} as BPBlock;
  static __Item = {} as BPItem;
  path: string;
  name: string;

  #files: BPFiles[] = [];
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
      new Promise(resolve =>
        resolve(() =>
          ({
            format_version: 2,
            header: {
              name: this.name,
              description,
              uuid: uuid(),
              version: [1, 0, 0],
              min_engine_version: [1, 17, 0],
            },
            modules: [{ type: 'data', uuid: uuid(), version: [1, 0, 0] }],
          }._toString())
        )
      ),
    ]);
  }
  Item(name: string): BPItem {
    return new BPItem(this, name);
  }
  Block(name: string): BPBlock {
    return new BPBlock(this, name);
  }
  setFile(file: BPFiles): this {
    this.#files.push([
      `${this.path}/${
        // Se valida que no sean iguales para no causar conflictos con el RP
        this.addon.onlypath ? `BP/${this.name}` : `${this.name}`
      }/${file[0]}`,
      file[1],
    ]);
    return this;
  }

  get _files(): BPFiles[] {
    return this.#files;
  }
}

export = BP;
