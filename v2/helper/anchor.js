const {generateAnchor,generateVDomAnchor} =require('./generators').anchor;
class Anchor {
    constructor() {
        this._block;
        this._parentBlock;
        this._index=0;
    }
    enter() {
        let current = new Anchor()
        current._key = generateAnchor(this._index);
        this._index++
        return current;
    }
    set parentBlock(value){
        this._parentBlock = value;
    }
    get parentBlock(){
        return this._parentBlock; 
    }
    set block(value) {
        this._block = value;
    }
    get block() {
        return this._block;
    }
    get statement() {
        return generateVDomAnchor(this)
    }
    get key() {
        return this._key;
    }
    get nodeIndex() {
        return ZERO;
    }
}



module.exports = Anchor;