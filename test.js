const Addon = require('./dist');

console.log(Addon)

const addon = new Addon('Hello World', {path: 'test'});

const bp = addon.BP({description: 'Hello World'});

Addon.build(addon);
