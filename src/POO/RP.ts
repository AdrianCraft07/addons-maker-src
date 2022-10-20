
import Addon from '.'

export default class RP{
  constructor(public addon: Addon, public description: string = 'By Aga Addons-Maker \n@agacraft/addons-maker in npm'){
    addon.addDir(this);
  }
  build(): void {
    console.log('RP')
  }
}