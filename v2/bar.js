import { VDom, define, decorate, getEventScope } from './dom/index.js';

class Bar extends HTMLElement {
  static get tag() {
    return 'x-bar';
  }

  static get inputs() {
    return {
      name: "pedro"
    };
  }

}

decorate(Bar, render);
define(Bar);

function render($) {
  var first = $.first,
      target = $.target || $,
      vdom = new VDom(first, target);
  vdom.append(0, 0, 0, 'div', 'div');
  vdom.appendText(0, 0, 0, 'text', 0, $.name);
  vdom.closeElement();
  vdom.close();
  vdom = null;
}