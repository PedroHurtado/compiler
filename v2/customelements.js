const supportCustomElements = "customElements" in self;
const noop = function(){}
const htmlElement = self.HtmlElement || noop;
class Define {
  constructor() {
    this.types = new Map();
  }
  add(tag, ctor) {
    let customElement = ctor.prototype instanceof htmlElement;
    if (customElement && (supportCustomElements && !customElements.get(tag))) {
      customElement.define(tag, ctor);
    }
    this.types.set(tag, {ctor,customElement});
  }
  get(tag) {
    return this.types.get(tag);
  }
}

const define = new Define();

module.exports.define = function(tag, ctor) {
  define.add(tag, ctor);
};
module.exports.getConstructor = function(tag) {
  return define.get(tag);
};