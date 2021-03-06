import { VDom, define, decorate, getEventScope } from './dom/index.js';

export default class Bar {
  static get tag() {
    return 'x-bar';
  }
  static get inputs() {
    return {
      description: "pedro"
    };
  }

}

decorate(Bar, render);
define(Bar);

function render($) {
  var vdom = new VDom($);
  vdom.append(0, 0, 0, 'div', 'div', 0);
  vdom.appendText(0, 0, 0, 'text', 0, $.description);
  vdom.closeElement();
  vdom.close();
  vdom = null;
}