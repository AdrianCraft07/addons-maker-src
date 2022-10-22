# Aga Addons Maker

Aga addons maker es un generador de addons para minecraft bedrock apartir de codigo de JavaScript

Los componentes de este creador de addons esta basado en la documentacion del sitio <a href="https://bedrock.dev">bedrock.dev</a>

## Code example

```JavaScript
const Addon = require('@agacraft/addons-maker');

const addon = new Addon('Addon', {path:'test'});
const BP = addon.BP({description:'My BP'});
const RP = addon.RP({description:'My RP'});

const Items = RP.Item();
const item = BP.Item('My item');
Items.add(item);

const Blocks = RP.Block();
const block = BP.Block('My block');
Blocks.add(block, {sound:'metal'});

Addon.build(addon);
```

## Other Valid Code
```JavaScript
const Addon = require('@agacraft/addons-maker');

const addon = new Addon('Addon', { path: 'test' });
const BP = new Addon.BP(addon, { name: 'My Custom BP' });
const RP = new Addon.RP(addon, { name: 'My Custom RP', description: 'My RP' });

const Items = RP.Item();
const item = BP.Item('My item');
Items.add(item);

const Blocks = RP.Block();
const block = BP.Block('My block');
Blocks.add(block, { sound: 'metal' });

Addon.build(addon);

```

## BPBlock and BPItem with function component
```JavaScript
item.component('minecraft:icon', {texture: 'my_item'});
block.component('minecraft:display_name', 'My block');
```
