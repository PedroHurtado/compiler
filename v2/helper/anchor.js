const t = require('@babel/types');

const ZERO = t.numericLiteral(0);
const VDOM = t.identifier('vdom');
const ANCHOR = t.identifier('anchor');



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
    }
    enter() {
        let current = new Anchor()
        current._key = generateAnchor(this._index);
        this._index++
        return current;
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
        return this._key;
    }
    get nodeIndex() {
        return ZERO;
    }
}



module.exports = Anchor;