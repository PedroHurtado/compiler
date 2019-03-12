const {GENERATENUMERIC,GENERATESTRING,ZERO} = require('./constans');

class Block {
    constructor() {
        this._each = null;
        this._parent=null;
        this._index = 0;
        this._key = null;
    }
    enter() {
        let current= new Block();
        current._key = GENERATENUMERIC(this._index);
        this._index++;
        return current;
    }
    set parent(value) {
        if (!this._parent && value) {
            this._parent = value;
        }
    }
    get parent() {
        return GENERATESTRING(this._parent);
    }
    get key() {
        return this._key;
    }
    set each(value) {
        this._each = value;
    }
    get each() {
        return this._each;
    }
    get nodeIndex() {
        return this._each || ZERO;
    }
}

module.exports = Block;

