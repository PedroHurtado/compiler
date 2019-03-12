const { META, createMeta } = require('./meta');
const {GENERATESTRING,ISSEALDED,GENERATENUMERIC} = require('./constans');


let dom = new Map();
function getParent(parent, key, block) {
    let _parent = dom.get(parent);
    let value = {
        parent: [block.key.value, block.nodeIndex.value, key],
        each: block.each,
        extraEach: null
    };
    dom.set(key, value)
    if (block.each) {
        value.extraEach = [block.key, block.each, GENERATESTRING(key)];
    }
    if (!_parent) {
        return GENERATESTRING("0.0.target")
    }
    if (_parent.each) {
        let ArrayExpression = t.arrayExpression(
            _parent.extraEach
        );
        return ArrayExpression;
    }
    return GENERATESTRING(_parent.parent.join('.'));
}

function hasExpression(args) {
    let exp = args.filter(c => {
        return c.type.indexOf('Literal') === -1
    })
    return ISSEALDED(exp.length);
}
function transformText(args, block, anchor) {
    let [parent, key] = args;
    block.parent = parent.value;
    args[0] = getParent(parent.value, key.value, block);
    let sealed = hasExpression(args);
    let newArgs = [block.key, block.each || block.nodeIndex, anchor, sealed, ...args];
    return newArgs;
}
function transformAppend(args, block, anchor) {
    let [parent, key] = args;
    block.parent = parent.value;
    args[0] = getParent(parent.value, key.value, block);
    let newArgs = [block.key, block.each || block.nodeIndex, anchor, ...args];
    return newArgs;
}
function transformAttribute(args) {
    let sealed = hasExpression(args);
    let newArgs = [sealed, ...args];
    return newArgs;
}
function transformAnchors(args, { anchor }) {
    let { block, parentBlock,key } = anchor;
    let parent = getParent(block.parent.value,key.value,block)
    return [
        parentBlock.key,
        block.each || GENERATENUMERIC(0),
        ...args,
        parent
    ];
}

module.exports ={
    transformAppend,
    transformText,
    transformAnchors,
    transformAttribute,
}