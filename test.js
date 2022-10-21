const Addon = require('./dist');

const addon = new Addon('addon', { path: 'test' });

const BP = addon.BP();

const tool = BP.Item('super coal');

tool.component('minecraft:fuel', { duration: 1000 });

const RP = addon.RP();

const Items = RP.Item();

Items.addItem(tool);

Addon.build(addon);
