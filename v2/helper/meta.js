const t = require('@babel/types');

const META = Symbol("meta");
function createMeta(node, values) {
    let data = (node[META] = node[META] || {});
    for (k in values) {
        data[k] = values[k];
    }
}
function getMeta(path) {
    let { node } = path.findParent((path) => path.isBlockStatement()) || path.node;
    return node[META];
}
function getFunctionName(callee) {
    if (t.isIdentifier(callee)) {
        return callee.name;
    } else if (t.isMemberExpression(callee)) {
        return callee.property.name;
    }
}
module.exports={
    META,
    createMeta,
    getMeta,
    getFunctionName
}