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
  removeEvent
} from "./domfunctions.js";


const TARGETKEY = 0;
export class VDom {
  constructor(first, target,instance) {
    this.first = first;
    this.target = target;
    this.instance = instance;
    this.inizialice();
  }
  inizialice() {

    this.currentParent = this.getDefault({ action: "", key: TARGETKEY })
    this.last = new Map();
    this.last.set(TARGETKEY, this.currentParent);
    this.created = new Map();
    this.currentNode = null;
    this.parents = [this.currentParent];
    if (!this.first) {
      this.hidrate(this.target,this.target.__instanceKey);
    }
    else{
      this.target.__instanceKey = Date.now();
    }
  }
  hidrate(target,instanceKey) {
    let parentKey = target.__key;
    for (let value of target.childNodes) {
      let { __key, __state , __style,childNodes } = value;
      if (value.__key && value.__instanceParentKey === instanceKey) {
        this.last.set(
          __key,
          this.getDefault({
            node: value,
            state: __state,
            style: __style,
            action: "",
            parentKey: parentKey
          })
        );
        if (childNodes) {
          this.hidrate(value,instanceKey);
        }
      }
    }
  }
  generateKey(...key) {
    return key.join(".");
  }
  generateParentKey(parent) {
    return Array.isArray(parent) ? parent.join(".") : parent;
  }
  getDefault(init) {
    let defaultNode = Object.assign({}, VDom.default(), init);
    defaultNode.children = [];
    Object.defineProperty(defaultNode, "next", {
      get: function () {
        let sibiling = this.parent.children[this.index + 1];
        if (sibiling && sibiling.node.parentNode) {
          return sibiling.node;
        }
        return null;
      }
    });
    return defaultNode;
  }
  createCurrentNode(key, tag, parent) {
    if (this.first) {
      return this.getDefault({ key:key, tag, parent, parentKey: parent.key });
    } else {
      let current = this.last.get(key);
      if (current) {
        this.last.delete(key);
        return current;
      }
      return this.getDefault({ key:key,tag, parent, parentKey: parent.key });
    }
  }
  addDom(key, currentNode) {
    this.created.set(key, currentNode);
  }

  append(block, key, subkey, tagKey, tag) {
    key = this.generateKey(block, key, subkey, tagKey);
    let parent = this.currentParent;
    this.currentNode = this.createCurrentNode(key, tag, parent);
    let { action } = this.currentNode;
    if (action === "c") {
      this.currentNode.node = create(tag);
      this.currentNode.node.__key = key;
      this.currentNode.node.__instanceParentKey = this.target.__instanceKey;
      this.addDom(key, this.currentNode);
    }
    this.currentNode.index = parent.children.push(this.currentNode) - 1;
    this.currentParent = this.currentNode;
    this.parents.push(this.currentParent);
  }

  appendText(block, key, subkey, tagKey, sealed, ...values) {
    key = this.generateKey(block, key, subkey, tagKey);
    let value = values.join("");
    let parent = this.currentParent;
    this.currentNode = this.createCurrentNode(key, "text", parent);
    let { action, node } = this.currentNode;
    let state = (this.currentNode.state = this.currentNode.state || {});
    if (action === "c") {
      this.currentNode.node = createText(value);
      this.currentNode.node.__key = key;
      this.currentNode.node.__instanceParentKey = this.target.__instanceKey;
      this.addDom(key, this.currentNode);
      if (sealed === 0) {
        state.text = {
          value: value
        };
        this.currentNode.node.__state = state;
      }
      
    } else if (sealed === 0) {
      if (state.text.value !== value) {
        state.text.value = value;
        updateText(node, value);
      }
    }
    this.currentNode.index = parent.children.push(this.currentNode) - 1;

  }
  appendComponent(block, key, subkey, tagKey, tag) {
    this.append(block, key, subkey, tagKey, tag);
    let { ctor, customElement } = getConstructor(tag);
    if (!customElement) {
      this.currentNode.instance = new ctor();
    }
    else {
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
  ref(name){
    let {node} = this.currentNode;
    this.instance.refs[name] = node;
    node.__ref = name;
  }
  closeElement() {
    this.parents.pop();
    this.currentParent = this.parents[this.parents.length - 1];
  }

  appendAttribute(sealed, attr, ...values) {
    let value = values.join("");
    let { action, node } = this.currentNode;
    let state = (this.currentNode.state = this.currentNode.state || {});
    if (action === "c") {
      if (sealed === 0) {
        state[attr] = {
          value: value
        };
        node.__state = state;
      }
      setAttribute(node, attr, value);
    } else if (sealed === 0) {
      let old = state[attr];
      if (old.value != value) {
        old.value = value;
        setAttribute(node, attr, value);
      }
    }
  }
  style(sealed, prop, ...values){
    let value = values.join("");
    let { action, node } = this.currentNode;
    let state = (this.currentNode.style = this.currentNode.style || {});
    if (action === "c") {
      if (sealed === 0) {
        state[prop] = {
          value: value
        };
        node.__style = state;
      }
      style(node, prop, value);
    } else if (sealed === 0) {
      let old = state[prop];
      if (old.value != value) {
        old.value = value;
        style(node, prop, value);
      }
    }
  }
  appendEvent(event, handler, scope) {
    let { node, action } = this.currentNode;
    let events = (node.__events = node.__events || {});
    if (action === "c") {
      events[event] = { handler, scope };
      createEvent(node, event, handler);
    } else {
      events[event].scope = null;
      events[event].scope = scope;
    }
  }
  createNodes(target) {
    let rootNodes = [];

    for (let [key, value] of this.created) {
      let { node, parentKey, children } = value;
      children.forEach(child => {
        append(node, child.node, child.next);
        child = null;
      });
      if (!this.created.get(parentKey)) {
        rootNodes.push(value);
      }
    }
    rootNodes.forEach(item => {
      let { node, parent } = item;
      if (parent.node) {
        append(parent.node, node, item.next);
      } else {
        append(this.target, node, item.next);
      }
    });
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
  removeRef(node){
    let {__ref} = node; 
    if(__ref && this.instance.refs){
      delete this.instance.refs[__ref];
    }
  }
  removeNodes() {
    let rootNodes = [];
    this.last.delete(TARGETKEY);
    for (let [key, value] of this.last) {
      let { node, parentKey } = value;
      this.removeEvents(node);
      this.removeRef(node);
      if (!this.last.get(parentKey)) {
        rootNodes.push(node);
      }
    }
    rootNodes.forEach(node => {
      remove(node);
    });
  }
  close() {
    this.removeNodes();
    this.createNodes();
    this.last = null;
    this.currentNode = null;
    this.created = null;
    this.target = null;
    this.currentParent = null;
    this.parents = null;
    this.instance = null;
  }
  static default() {
    return {
      tag: null,
      action: "c",
      state: null,
      parent: null,
      parentKey: null,
      children: null,
      index: 0
    };
  }
}
