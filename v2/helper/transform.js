const { META, createMeta } = require("./meta");
const { GENERATESTRING, ISSEALDED, GENERATENUMERIC,ZERO } = require("./constans");
const {generateArrayExpression} = require('./generators')
const TARGET = GENERATESTRING("0.0.target");
const LITERAL = "Literal";

let nodes;
function getParent(parent, key, block) {
  let _parent = nodes.get(parent);
  let value = {
    parent: [block.key.value, block.nodeIndex.value, key],
    each: block.each,
    extraEach: null
  };
  nodes.set(key, value);
  if (block.each) {
    value.extraEach = [block.key, block.each, GENERATESTRING(key)];
  }
  if (!_parent) {
    return TARGET;
  }
  if (_parent.each) {
    return generateArrayExpression(_parent.extraEach);
  }
  return GENERATESTRING(_parent.parent.join("."));
}

function hasExpression(args) {
  let exp = args.filter(c => {
    return c.type.indexOf(LITERAL) === -1;
  });
  return ISSEALDED(exp.length);
}
function transformText(args, block, anchor) {
  let [parent, key, ...next] = args;
  block.parent = parent.value;
  parent = getParent(parent.value, key.value, block);
  let sealed = hasExpression(args);
  let newArgs = [
    block.key,
    block.each || block.nodeIndex,
    key,
    anchor,
    parent,
    sealed,
    ...next
  ];
  return newArgs;
}
function transformAppend(args, block, anchor) {
  let [parent, key, tag] = args;
  block.parent = parent.value;
  parent = getParent(parent.value, key.value, block);
  let newArgs = [
    block.key,
    block.each || block.nodeIndex,
    key,
    parent,
    anchor,
    tag
  ];
  return newArgs;
}
function transformAttribute(args) {
  let sealed = hasExpression(args);
  let newArgs = [sealed, ...args];
  return newArgs;
}
function transformAnchor(args, { anchor }) {
  let { block, parentBlock, key } = anchor;
  let parent = getParent(block.parent.value, key.value, block);
  return [parentBlock.key, parentBlock.each || ZERO, ...args, parent];
}

function initNodes() {
  nodes = new Map();
}
module.exports = {
  transformAppend,
  transformText,
  transformAnchor,
  transformAttribute,
  initNodes
};
