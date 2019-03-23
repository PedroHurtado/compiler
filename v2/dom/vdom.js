import { getConstructor } from "./customelements.js";

import {
  create,
  append,
  createEvent,
  createText,
  updateText,
  setAttribute,
  remove,
  removeEvent
} from "./domfunctions.js";

const TARGETKEY = "0.0.0.target"
export class VDom {
  constructor(first, target) {
    this.first = first;
    this.target = target;
    this.inizialice();
  }
  inizialice() {
    
    this.currentParent =this.getDefault({ action: "", key:TARGETKEY })
    this.last = new Map();
    this.last.set(TARGETKEY, this.currentParent);
    this.created = new Map();
    this.currentNode = null;
    this.parents = [this.currentParent];
    if (!this.first) {
      this.hidrate(this.target);
    }
  }
  hidrate(target) {
    let parentKey = target.__key;
    for (let value of target.childNodes) {
      let { __key, __state } = value;
      if (value.__key) {
        this.last.set(
          __key,
          this.getDefault({
            node: value,
            state: __state,
            action: "",
            parentKey: parentKey
          })
        );
        if (value.childNodes) {
          this.hidrate(value);
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
      get: function() {
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
      return this.getDefault({ tag, parent, parentKey:parent.key });
    } else {
      let current = this.last.get(key);
      if (current) {
        this.last.delete(key);
        return current;
      }
      return this.getDefault({ tag, parent, parentKey:parent.key });
    }
  }
  addDom(key, currentNode) {
    this.created.set(key, currentNode);
  }
 
  append(block, key, subkey, tagKey,tag) {
    key = this.generateKey(block, key, subkey, tagKey);
    let parent = this.currentParent;
    this.currentNode = this.createCurrentNode(key, tag, parent);
    let { action } = this.currentNode;
    if (action === "c") {
      this.currentNode.node = create(tag);
      this.currentNode.node.__key = key;
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
      if (sealed === 0) {
        state.text = {
          value: value
        };
        this.currentNode.node.__state = state;
      }
      this.addDom(key, this.currentNode);
    } else if (sealed === 0) {
      if (state.text.value !== value) {
        state.text.value = value;
        updateText(node, value);
      }
    }
    this.currentNode.index = parent.children.push(this.currentNode) - 1;

  }
  appendComponent(block, key, subkey, tagKey, tag){
      this.append(block, key, subkey, tagKey, tag);
      let {ctor,customElement} = getConstructor(tag);
      if(!customElement){
        new ctor();
      }
  }
  inputs(values){
    //sino values set
    //else construir objeto a partir de los elementos 
    //del array pasada and set properties
  }
  output(outputName,handler,scope){
     handler.scope = scope;
  }
  closeElement(){
    this.parents.pop();
    this.currentParent = this.parents[this.parents.length-1];
  }
  appendAttribute(sealed, attr, ...values) {
    let value = values.join("");
    let { action,node } = this.currentNode;
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
    let domParents = [];

    for (let [key, value] of this.created) {
      let { node, parentKey, children } = value;
      children.forEach(child => {
        append(node, child.node, child.next);
        child = null;
      });
      if (!this.created.get(parentKey)) {
        domParents.push(value);
      }
    }
    domParents.forEach(item => {
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
  removeNodes() {
    let domParents = [];
    this.last.delete(TARGETKEY);
    for (let [key, value] of this.last) {
      let { node, parentKey } = value;
      this.removeEvents(node);
      if (!this.last.get(parentKey)) {
        domParents.push(node);
      }
    }
    domParents.forEach(node => {
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
  }
  static default(){
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
