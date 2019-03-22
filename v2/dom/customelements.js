const supportCustomElements = "customElements" in self;
const noop = function(){}
class Define {
  constructor() {
    this.types = new Map();
  }
  add(tag, ctor) {
    if(!tag){
        throw 'tag is not defined';
    }
    const htmlElement = self.HTMLElement || noop;
    const customElement = ctor.prototype instanceof htmlElement;
    this.types.set(tag, {ctor,customElement});
    if (customElement && (supportCustomElements && !self.customElements.get(tag))) {
      self.customElements.define(tag, ctor);
    }
  }
  get(tag) {
    return this.types.get(tag);
  }
}

const _define = new Define();

export function define(ctor) {
   if(!ctor){
       throw 'class is not defined';
   }
  _define.add(ctor.tag, ctor);
};
export function getConstructor(tag) {
  return _define.get(tag);
};