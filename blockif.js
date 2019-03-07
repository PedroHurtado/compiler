const t = require('@babel/types');
module.exports = class BlockIf{
    constructor(blockIf,identifier){
        this.blockIf = blockIf;
        this.current = blockIf;
        this.identifier = identifier;
        this.alternateText = []
        this._blockParent;
    }
    addConsequent(consequent){
        this.current.consequent = this._createReturnStatement(consequent);
    }
    set test(test){
       this.blockIf.test = test;
    }
    set testAlternate(test){
       let alternate = this.alternateText.pop();
       if(alternate){
          alternate.test = test;
       }
    }
    set blockParent(value){
        if(!this._blockParent && value){
            this._blockParent = value;
        }
    }
    get blockParent(){
        return this._blockParent
    }
    get parentName(){
        return this.blockParent.parent.name;
    }
    _createReturnStatement(identifier){
        return t.returnStatement(identifier);
    }
    normalizeBlock(){
        if(!this.current.alternate){
            this.current.alternate = this._createReturnStatement(t.identifier('noopBlock'))
        }
    }
    addAlternate(alternate){
        if(t.isIfStatement(alternate)){   
            this.alternateText.push(alternate); 
            this.current.alternate = alternate;
            this.current = alternate;
        }
        else{
            this.current.alternate = this._createReturnStatement(alternate);
        }
    }
}