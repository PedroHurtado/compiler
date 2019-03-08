class VDom{
    constructor(){
        this.last = new Map();
        this.current = new Map();
        this.currentNode;
    }
    generateKey(block,key){
        return `${block.padStart(3,'0')}-${key.padStart(4,'0')}`
    }
    createCurrentNode(key,tag){
        return this.last.get(key) || {key:key,tag:tag,action:'c',state:{}}
    }
    append(block,key,tag,parent){
        let key = this.generateKey(block,key);
        this.currentNode = this.createCurrentNode(key)
        let {action,state} = this.currentNode;
    }
    appendText(block,key,sealed,tag,parent,...value){
        let key = this.generateKey(block,key);
        this.currentNode = this.createCurrentNode(key,tag);
        let {action,state} = this.currentNode;
        if(action === 'c'){
            state.text = {value:value.join(''),sealed:sealed};
        }
        this.current.set(key,this.currentNode);
    }
    appendAttribute(attr,sealed,...value){
        let {action,state} = this.currentNode;
        if(action === 'c'){
            state[attr] =  {value:value.join(''),sealed:sealed};
        }
        this.current.set(key,this.currentNode);
    }
}