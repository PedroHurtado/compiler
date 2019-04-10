import { decorateDirective } from './decoratedirective.js'

const supportCustomElements = "customElements" in self;
const noop = function () { }
class Define {
  constructor() {
    this.types = new Map();
  }
  add(tag, extend, ctor) {
    const htmlElement = self.HTMLElement || noop;
    const customElement = ctor.prototype instanceof htmlElement;
    this.types.set(tag, { ctor, customElement, extend });
    if (customElement && (supportCustomElements && !self.customElements.get(tag))) {
      if(extend){
        self.customElements.define(tag,ctor,{extends:extend})
      }else
      {
        self.customElements.define(tag, ctor);
      }
    }
  }
  addDirective(tag, ctor) {
    this.types.set(tag, { ctor, directive: true });
  }
  get(tag) {
    return this.types.get(tag);
  }
}

const _define = new Define();

function validateCtor(ctor) {
  if (!ctor) {
    throw 'class is not defined';
  }
  if (!ctor.tag) {
    throw 'tag is not defined';
  }
}

export function define(ctor) {
  validateCtor(ctor);
  _define.add(ctor.tag, ctor.extend, ctor);
};
export function defineDirective(ctor) {
  validateCtor(ctor);
  decorateDirective(ctor);
  _define.addDirective(ctor.tag, ctor);
}
export function getConstructor(tag) {
  return _define.get(tag);
};