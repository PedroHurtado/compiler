class VDom {
    constructor(first) {
        this.first = first;
        this.last = new Map();
        this.inizialice();
    }
    inizialice() {
        this.current = new Map();
        this.dom = new Map();
        this.currentNode = null;
        this.default = {
            tag: null,
            action: 'c',
            state: null,
            anchor: null,
            parent: null,
        };
    }
    generateKey(...key) {
        return key.join('.');
    }
    generateParent(parent) {
        return Array.isArray(parent) ? this.generateKey(parent) : parent;
    }
    getDefault(init) {
        let defaultNode = Object.assign({}, this.default, init);
        defaultNode.state = {};
        return defaultNode;
    }
    createCurrentNode(key, tag, anchor, parent) {
        if (this.first) {
            return this.getDefault({ tag, anchor, parent });
        }
        else {
            let current = this.last.get(key)
            if (current) {
                this.last.delete(key);
                return current;
            }
            return this.getDefault({ tag, anchor, parent });
        }
    }
    setParent(parentKey, key, node) {
        let current = this.dom.get(parentKey);
        if (current) {
            current.children.push(node);
        }
        let parent = this.current.get(parentKey)
        if(parent){
            parent = parent.node;
        } 
        this.dom.set(key, { node, parent, parentKey, children: [] })

    }
    append(block, key, anchor, parent, tagKey, tag) {
        let _key = this.generateKey(block, key, tagKey);
        let _parent = this.generateParent(parent);
        this.currentNode = this.createCurrentNode(
            _key,
            tag,
            anchor,
            this.generateParent(parent)
        );
        let { action, state, } = this.currentNode;
        if (action === 'c') {
            this.current.set(_key, this.currentNode);
            this.currentNode.node = create(tag);
            this.setParent(_parent, _key, this.currentNode.node);
        } else {
            this.current.set(_key, this.currentNode);
        }

    }

    appendText(block, key, anchor, sealed, parent, tagKey, ...value) {
        let _key = this.generateKey(block, key, tagKey);
        let _value = value.join('');
        let _parent = this.generateParent(parent)
        this.currentNode = this.createCurrentNode(
            _key,
            'text',
            anchor,
            _parent
        );
        let { action, state, node, } = this.currentNode;

        if (action === 'c') {
            state.text = {
                value: _value,
            };
            this.current.set(_key, this.currentNode);
            this.currentNode.node = createText(_value);
            this.setParent(_parent, _key, this.currentNode.node);
        } else if (sealed === 0) {
            if (state.text.value !== _value) {
                state.text.value = _value;
                updateText(node, _value);
            }
            this.current.set(_key, this.currentNode);
        }

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
    anchor(block, key, anchor) {

    }
    reduceDom(target) {
        let domParents = [];

        for (let [key, value] of this.dom) {
            let {
                node,
                parentKey,
                children
            } = value;
           children.forEach(child => {
                append(node, child, null);
            });

            if (!this.dom.get(parentKey)) {
                domParents.push(node);
            }
        }
        domParents.forEach(node => {
            append(node.parent || target, node);
        });
    }
    close(target) {
        this.first = 0;
        for (let [key, value] of this.current) {
            value.action = ''
        }
        this.reduceDom(target);
        this.last = new Map(this.current);
        this.inizialice();
    }

}

module.exports.VDom = VDom;