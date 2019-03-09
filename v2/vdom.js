class VDom {
    constructor(first) {
        this.first = first;
        this.last = new Map();
        this.inizialice();
    }
    inizialice() {
        this.current = new Map();
        this.dom = new Map();
        this.dom.set('target', { node: null, children: [] })
        this.currentNode = null;
        this.default = {
            tag: null,
            action: 'c',
            state: {},
            _anchor: null,
        };
    }
    generateKey(block, key, tagKey) {
        return `${block.toString().padStart(3, '0')}.${key.toString().padStart(4, '0')}.${tagKey}`;
    }
    getDefault(tag, anchor) {
        this.default.tag = tag;
        this.default.anchor = anchor;
        return this.default;
    }
    createCurrentNode(key, tag, anchor) {
        if (this.first) {
            return this.getDefault(tag, anchor);
        }
        else {
            let current = this.last.get(key)
            if (current) {
                this.last.delete(key);
                return current;
            }
            return this.getDefault(tag, anchor);
        }
    }
    setParent(parent, tagKey, node) {
        let current = this.dom.get(parent);
        if (!current) {
            current = { node: node, children: [] };
            this.dom.set(tagKey, current)
        }
        else {
            current.children.push(node);
        }
    }
    append(block, key, anchor, parent, tagKey, tag) {
        let _key = this.generateKey(block, key, tagKey);

        this.currentNode = this.createCurrentNode(_key, tag, anchor);
        let {
            action,
            state,
            _anchor
        } = this.currentNode;
        if (action === 'c') {
            this.current.set(_key, this.currentNode);
            this.currentNode.node = create(tag);
        } else {
            this.current.set(_key, this.currentNode);
        }
        this.setParent(parent, tagKey, this.currentNode.node);
    }

    appendText(block, key, anchor, sealed, parent, tagKey, ...value) {
        let _key = this.generateKey(block, key, tagKey);
        let _value = value.join('');
        this.currentNode = this.createCurrentNode(_key, 'text', anchor);
        let {
            action,
            state,
            node,
            _anchor
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
        this.setParent(parent, tagKey, this.currentNode.node);
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
    anchor(anchor) {
        
    }
    close() {
        this.first = 0;
        for (let [key, value] of this.current) {
            value.action = ''
        }
        this.last = new Map(this.current);
        this.inizialice();
    }

}

module.exports.VDom = VDom;