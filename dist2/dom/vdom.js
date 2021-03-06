import { getConstructor } from "./customelements.js";

import {
  create,
  append,
  createEvent,
  createText,
  updateText,
  setAttribute,
  style,
  remove,
  removeEvent,
  insertAdjacentHTML,
  removeAdjacentHTML,
  walker,
} from "./domfunctions.js";

import { Node } from './node.js'


const TARGETKEY = 'root';

export class VDom {
  constructor(instance) {
    this.first = instance.first;
    this.target = instance.target || instance.__node || instance;
    this.instance = instance;
    this.inizialice();
  }
  inizialice() {

    this.currentParent = new Node(TARGETKEY);
    this.currentParent.action = "";
    this.last = new Map();
    this.last.set(TARGETKEY, this.currentParent);
    this.created = new Map();
    this.currentNode = null;
    this.parents = [this.currentParent];
    if (!this.first) {
      this.hidrate(this.target, this.target.__instanceKey);
    }
    else {
      this.target.__instanceKey = Date.now();
    }
  }
  hidrate(root, instanceKey) {
    let treeWalker = walker(root, instanceKey);
    let domNode;
    while ((domNode = treeWalker.nextNode())) {
      let { __key, __state, __style, __instance } = domNode;
      let parentKey = domNode.parentNode.__key || TARGETKEY;
      let node = new Node(__key);
      node.hidrate(domNode, __state, __style, __instance, parentKey);
      this.last.set(__key, node);
    }
    treeWalker = null;
  }
  generateKey(...key) {
    return key.join(".");
  }
  getOrCreateNode(key) {
    if (this.first) {
      return new Node(key);
    } else {
      let current = this.last.get(key);
      if (current) {
        this.last.delete(key);
        return current;
      }
      return new Node(key);
    }
  }
  addDom(key, node) {
    this.currentNode.node = node;
    this.currentNode.node.__key = key;
    this.currentNode.node.__instanceParentKey = this.target.__instanceKey;
    this.created.set(key, this.currentNode);
  }
  addToParent() {
    this.currentNode.parent = this.currentParent;
    this.currentNode.parentKey = this.currentParent.key
    this.currentNode.index = this.currentParent.children.push(this.currentNode) - 1;
  }
  getState() {
    return (this.currentNode.state = this.currentNode.state || {});
  }
  createState(key, value) {
    let state = this.getState();
    state[key] = value;
    this.currentNode.node.__state = state;
  }
  updateState(key, value) {
    let state = this.getState();
    if (state[key] !== value) {
      state[key] = value;
      return true;
    }
    return false;
  }
  append(block, key, subkey, tagKey, tag, namespace = 0, extend = null) {
    key = this.generateKey(block, key, subkey, tagKey);
    this.currentNode = this.getOrCreateNode(key);
    let { action } = this.currentNode;
    if (action === Node.CREATED) {
      this.addDom(key, create(tag, namespace, extend));
    }
    this.addToParent();
    this.currentParent = this.currentNode;
    this.parents.push(this.currentParent);
  }
  appendText(block, key, subkey, tagKey, sealed, ...values) {
    key = this.generateKey(block, key, subkey, tagKey);
    let value = values.join("");
    this.currentNode = this.getOrCreateNode(key);
    let { action, node } = this.currentNode;
    if (action === Node.CREATED) {
      this.addDom(key, createText(value));
      if (sealed === 0) {
        this.createState('text', value)
      }
    } else if (sealed === 0) {
      if (this.updateState('text', value)) {
        updateText(node, value)
      }
    }
    this.addToParent();
  }
  appendComponent(block, key, subkey, tagKey, tag) {
    let { ctor, customElement, extend } = getConstructor(tag);
    this.append(block, key, subkey, tagKey, tag, 0,extend);
    if (!customElement) {
      if (this.currentNode.action === Node.CREATED) {
        let instance = new ctor();
        instance.invoke = true;
        instance.__node = this.currentNode.node;
        instance.__node.__instance = instance;
        this.currentNode.instance = instance;
      }
    } else {
      this.currentNode.instance = this.currentNode.node;
    }
  }
  inputs(values) {
    let input = {};
    if (values) {
      input = values.map(value => {
        let obj = {};
        if (value.length > 2) {
          obj[value[0]] = value.slice(1).join('');
        } else {
          obj[value[0]] = value[1];
        }
        return obj;
      }).reduce((a, b) => {
        return Object.assign(a, b);
      }, {});
    }
    let { instance } = this.currentNode;
    if (instance && 'set' in instance) {
      instance.set(input);
    }
  }
  output(outputName, handler, scope) {
    let { instance } = this.currentNode;
    instance[outputName] = handler;
    handler.scope = scope;
  }
  directive(name, value) {
    let _directive = getConstructor(name);
    if (_directive) {
      let { action, node } = this.currentNode;
      let instance;
      node.__directives = node.__directives || {};
      if (action === Node.CREATED) {
        instance = node.__directives[name] = new _directive.ctor(
          node,
          this.instance
        );
      } else {
        instance = node.__directives[name];
      }
      if (value) {
        instance.set(value);
      }
    }

  }
  ref(name) {
    let { node } = this.currentNode;
    this.instance.refs[name] = node;
    node.__ref = name;
  }
  closeElement() {
    this.parents.pop();
    this.currentParent = this.parents[this.parents.length - 1];
  }
  getValueAttribute(values) {
    if (values.length > 1) {
      return values.join("");
    }
    else {
      return values[0];
    }
  }
  appendAttribute(sealed, attr, ...values) {
    let value = this.getValueAttribute(values);
    let { action, node } = this.currentNode;
    if (action === Node.CREATED) {
      if (sealed === 0) {
        this.createState(attr, value);
      }
      setAttribute(node, attr, value);
    } else if (sealed === 0) {
      if (this.updateState(attr, value)) {
        setAttribute(node, attr, value);
      }
    }
  }
  style(sealed, prop, ...values) {
    let value = values.join("");
    let { action, node } = this.currentNode;
    let state = (this.currentNode.style = this.currentNode.style || {});
    if (action === Node.CREATED) {
      if (sealed === 0) {
        state[prop] = value;
        node.__style = state;
      }
      style(node, prop, value);
    } else if (sealed === 0) {
      let old = state[prop];
      if (old != value) {
        state[prop] = value;
        style(node, prop, value);
      }
    }
  }
  html(block, key, subkey, tagKey, sealed, ...values) {
    key = this.generateKey(block, key, subkey, tagKey);
    let value = values.join("");
    this.currentNode = this.getOrCreateNode(key);
    let { action, node } = this.currentNode;
    if (action === Node.CREATED) {
      this.addDom(key, create('noscript', 0));
      if (sealed === 0) {
        this.createState('html', value)
      }

    } else if (sealed === 0) {
      if (this.updateState('html', value)) {
        removeAdjacentHTML(node);
        insertAdjacentHTML(node, value);
      }
    }
    this.addToParent();
  }
  appendEvent(event, handler, scope) {
    let { node, action } = this.currentNode;
    let events = (node.__events = node.__events || {});
    if (action === Node.CREATED) {
      events[event] = { handler, scope };
      createEvent(node, event, handler);
    } else {
      events[event].scope = null;
      events[event].scope = scope;
    }
  }

  removeEvents(node) {
    let events = node.__events;
    if (events) {
      for (let key in events) {
        let { handler, scope } = events[key];
        removeEvent(node, key, handler);
      }
      node.__events = null;
    }
  }
  removeRef(node) {
    let { __ref } = node;
    if (__ref && this.instance.refs) {
      delete this.instance.refs[__ref];
    }
  }
  removeDirectives(node) {
    if (node.__directives) {
      for (let key in node.__directives) {
        let directive = node.__directives[key];
        if ('disconnectedCallback' in directive) {
          directive.disconnectedCallback();
        }
      }
      node.__directives = null;
    }
  }
  removeNodes() {
    let rootNodes = [];
    let components = [];
    this.last.delete(TARGETKEY);
    for (let [key, value] of this.last) {
      let { node, parentKey } = value;
      let {instance} = node;
      if(instance && instance.invoke){
        components.push(instance);
      }
      this.removeEvents(node);
      this.removeRef(node);
      this.removeDirectives(node);
      if (!this.last.get(parentKey)) {
        rootNodes.push(node);
      }
    }
    rootNodes.forEach(node => {
      let { __state } = node;
      if (__state && __state.html) {
        removeAdjacentHTML(node);
      }
      remove(node);
    });

    components.forEach(component=>{
      if('disconnectedCallback' in component){
        component.disconnectedCallback();
      }
    });
  }

  createAdjacentHTML(child) {
    if (child.state && child.state.html) {
      if (this.first) {
        this.instance.pending.push({
          fn: insertAdjacentHTML, args: [child.node, child.state.html]
        })
      } else {
        insertAdjacentHTML(child.node, child.state.html);
      }
    }
  }
  connectDirectives(directives) {
    let nodeDirectives;
    while (nodeDirectives = directives.shift()) {
      for (let key in nodeDirectives) {
        let directive = nodeDirectives[key];
        if ('connectedCallback' in directive) {
          directive.connectedCallback();
        }
      }
    }
  }
  createNodes(target) {
    let rootNodes = [];
    let directives = [];

    for (let [key, value] of this.created) {
      let { node, parentKey, children } = value;
      children.forEach(child => {
        let { instance } = child;
        if (instance && instance.invoke) {
          instance.connectedCallback();
        }
        append(node, child.node, child.next);
        this.createAdjacentHTML(child);
        child = null;
      });
      if (!this.created.get(parentKey)) {
        rootNodes.push(value);
      }
      if (node.__directives) {
        directives.push(node.__directives);
      }
    }
    rootNodes.forEach(item => {
      let { node, parent, instance } = item;
      if (instance && instance.invoke) {
        instance.connectedCallback();
      }
      if (parent.node) {
        append(parent.node, node, item.next);
      } else {
        if (this.first) {
          this.instance.pending.push(
            { fn: append, args: [this.target, node, null] }
          );
        }
        else {
          append(this.target, node, item.next);
        }
      }
      this.createAdjacentHTML(item);
    });
    this.connectDirectives(directives);
  }
  close() {
    this.removeNodes();
    this.createNodes();
    this.dispose();
  }
  dispose() {
    this.last = null;
    this.currentNode = null;
    this.created = null;
    this.target = null;
    this.currentParent = null;
    this.parents = null;
    this.instance = null;
  }
}
