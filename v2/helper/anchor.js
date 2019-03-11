const t = require('@babel/types');

const ZERO = t.numericLiteral(0);
const VDOM = t.identifier('vdom');
const ANCHOR = t.identifier('anchor');
const NULL = t.nullLiteral();


function generateAnchor(id) {
    return t.stringLiteral(`anchor${id}`);
}
function generateVDomAnchor(anchor) {
    let anchorcall = t.callExpression(
        t.memberExpression(VDOM, ANCHOR),
        [anchor]
    );
    return t.expressionStatement(anchorcall);
}


class Anchor {
    constructor() {
        this._block;
        this._index=0;
        this._anchors =[];
    }
    enter() {
        let current = new Anchor()
        current._key = t.numericLiteral(this._index);
        this._anchors.push(current);
        this._index++
        return current;
    }
    exit() {
        this._anchors.pop();
        return anchors[this._anchors.length - 1];
    }
    set block(value) {
        this._block = value;
    }
    get block() {
        return this._block;
    }
    get statement() {
        return generateVDomAnchor(this._key)
    }
    get key() {
        return this._key || NULL
    }
    get nodeIndex() {
        return ZERO;
    }
}



module.exports = Anchor;