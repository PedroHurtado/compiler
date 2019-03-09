module.exports = class DomNodes{
    constructor(){
        this.root ='target';
        this.nodes =new Map();
    }
    setNode(node,parent){
        let _node = node.replace('$$_','');
        let _parent = parent.replace('$$_','')
        this.nodes.set(_node,_parent)
    }
    getParent(node){
        let parent = this.nodes.get(node);
        return parent || this.root;
    }
}