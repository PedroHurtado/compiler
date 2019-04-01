export class Node {
    constructor(key) {
        this.key = key;
        this.children = [];
        this.index = 0;
        this.action = Node.CREATED;
        this.parent = null;
        this.parentKey = null;
        this.node = null;
        this.state = null;
        this.style = null;
    }
    get next() {
        let sibiling = this.parent.children[this.index + 1];
        if (sibiling && sibiling.node.parentNode) {
            return sibiling.node;
        }
        return null;
    }
    hidrate(node,state,style,parentKey){
        this.node=node;
        this.state = state;
        this.style = style;
        this.parentKey = parentKey;
        this.action = "";
    }
}
Node.CREATED = "c"