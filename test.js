const Addon = require('./dist');

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

Addon.compress(addon);
