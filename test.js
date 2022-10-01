const Addon = require('./dist');

const addon1 = new Addon('addon 1', {path: './test'});
const bp = addon1.BP('null');

const helmet = bp.Item('minecraft helmet');
const chestplate = bp.Item('minecraft chestplate');
const leggings = bp.Item('minecraft leggings');
const boots = bp.Item('minecraft boots');

addon1
  .RP()
  .Item()
  .addItem(helmet, { type: 'helmet', ...helmet.getResource() })
  .addItem(chestplate, { type: 'chestplate' })
  .addItem(leggings, { type: 'leggings' })
  .addItem(boots, { type: 'boots' });

addon1.build();