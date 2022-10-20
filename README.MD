# Aga Addons Maker

Aga addons maker es un generador de addons para minecraft bedrock apartir de codigo de JavaScript

## Code example
```JavaScript
const addon = new Addon('My addon', {path:'./test'});
const bp = addon.BP('My BP');
const rp = addon.RP('My RP');

const item = bp.Item('My Item');
const block = bp.Block('My Block');

rp.Item()
  .addItem(item)

rp.Block()

```
