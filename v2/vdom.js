class VDom {
    constructor() {
        this.last = new Map();
        this.inizialice();
    }
    inizialice() {
        this.current = new Map();
        this.dom = new Map();
        this.dom.set('target',{node:null,children:[]})
        this.currentNode = null;
    }
    generateKey(block, key, tagKey) {
        return `${block.toString().padStart(3, '0')}.${key.toString().padStart(4, '0')}.${tagKey}`;
    }
    createCurrentNode(key, tag) {
        let current = this.last.get(key)
        if (current) {
            this.last.delete(key);
            return current;
        }
        return {
            tag: tag,
            action: 'c',
            state: {},
        };
    }
    setParent(parent,tagKey,node){
        let current = this.dom.get(parent);
        if(!current){
            current = {node:node,children:[]};
            this.dom.set(tagKey,current)
        }
        else{
            current.children.push(node);
        }
    }
    append(block, key, parent, tagKey, tag) {
        let _key = this.generateKey(block, key, tagKey);

        this.currentNode = this.createCurrentNode(_key, tag);
        let {
            action,
            state
        } = this.currentNode;
        if (action === 'c') {
            this.current.set(_key, this.currentNode);
            this.currentNode.node = create(tag);
        } else {
            this.current.set(_key, this.currentNode);
        }
        this.setParent(parent,tagKey,this.currentNode.node);
    }

    appendText(block, key, sealed, parent, tagKey, ...value) {
        let _key = this.generateKey(block, key, tagKey);
        let _value = value.join('');
        this.currentNode = this.createCurrentNode(_key, 'text');
        let {
            action,
            state,
            node,
        } = this.currentNode;

        if (action === 'c') {
            state.text = {
                value: _value,
            };
            this.current.set(_key, this.currentNode);
            this.currentNode.node = createText(_value);
        } else if (sealed === 0) {
            if (state.text.value !== _value) {
                state.text.value = _value;
                updateText(node, _value);
            }
            this.current.set(_key, this.currentNode);
        }
        this.setParent(parent,tagKey,this.currentNode.node);
    }
    appendAttribute(sealed, attr, ...value) {
        let _value = value.join('');
        let {
            action,
            state,
            node,
        } = this.currentNode;

        if (action === 'c') {
            state[attr] = {
                value: _value
            };
            setAttribute(node, attr, _value);
        } else if (sealed === 0) {
            let old = state[attr];
            if (old.value != _value) {
                old.value = _value;
                setAttribute(node, attr, _value);
            }
        }
    }
    appendEvent() {

    }
    close() {
        for (let [key, value] of this.current) {
            value.action = ''
        }
        this.last = new Map(this.current);
        this.inizialice();
    }

}

module.exports.VDom = VDom;