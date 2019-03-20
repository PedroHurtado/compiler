class VDom {
    constructor(first, target) {
        this.first = first;
        this.target = target;
        this.inizialice();
    }
    inizialice() {
        this.default = {
            tag: null,
            action: "c",
            state: null,
            parent: null,
            parentKey: null,
            children: null,
            index: 0
        };
        this.current = new Map();
        this.current.set("0.0.0.target", this.getDefault({ action: "" }));
        this.last = new Map(this.current);
        this.created = new Map();
        this.currentNode = null;
        if (!this.first) {
            this.hidrate(this.target);
        }
    }
    hidrate(target) {
        let parentKey = target.__key;
        for (let value of target.childNodes) {
            let { __key, __state } = value;
            if (value.__key) {
                this.last.set(
                    __key,
                    this.getDefault({
                        node: value,
                        state: __state,
                        action: "",
                        parentKey:parentKey
                    })
                );
                if (value.childNodes) {
                    this.hidrate(value);
                }
            }
        }
    }
    generateKey(...key) {
        return key.join(".");
    }
    generateParentKey(parent) {
        return Array.isArray(parent) ? parent.join(".") : parent;
    }
    getDefault(init) {
        let defaultNode = Object.assign({}, this.default, init);
        defaultNode.children = [];
        Object.defineProperty(defaultNode, "next", {
            get: function () {
                let sibiling = this.parent.children[this.index + 1];
                if (sibiling && sibiling.node.parentNode) {
                    return sibiling.node;
                }
                return null;
            }
        });
        return defaultNode;
    }
    createCurrentNode(key, tag, parent, parentKey) {
        if (this.first) {
            return this.getDefault({ tag, parent, parentKey });
        } else {
            let current = this.last.get(key);
            if (current) {
                this.last.delete(key);
                return current;
            }
            return this.getDefault({ tag, parent, parentKey });
        }
    }
    addDom(key, currentNode) {
        this.created.set(key, currentNode);
    }
    getParent(parent) {
        return this.current.get(parent);
    }
    append(block, key, subkey, tagKey, parentKey, tag) {
        key = this.generateKey(block, key, subkey, tagKey);
        parentKey = this.generateParentKey(parentKey);
        let parent = this.getParent(parentKey);
        this.currentNode = this.createCurrentNode(key, tag, parent, parentKey);
        let { action } = this.currentNode;
        if (action === "c") {
            this.currentNode.node = create(tag);
            this.currentNode.node.__key = key;
            this.addDom(key, this.currentNode);
        }
        this.current.set(key, this.currentNode);
        this.currentNode.index = parent.children.push(this.currentNode) - 1;
    }

    appendText(block, key, subkey, tagKey, parentKey, sealed, ...values) {
        key = this.generateKey(block, key, subkey, tagKey);
        parentKey = this.generateParentKey(parentKey);
        let value = values.join("");
        let parent = this.getParent(parentKey);
        this.currentNode = this.createCurrentNode(key, "text", parent, parentKey);
        let { action, node } = this.currentNode;

        if (action === "c") {
            this.currentNode.node = createText(value);
            this.currentNode.node.__key = key;
            if (sealed === 0) {
                let state = (this.currentNode.state = this.currentNode.state || {});
                state.text = {
                    value: value
                };
                this.currentNode.node.__state = state;
            }
            this.addDom(key, this.currentNode);
        } else if (sealed === 0) {
            let state = (this.currentNode.state = this.currentNode.state || {});
            if (state.text.value !== value) {
                state.text.value = value;
                updateText(node, value);
            }
        }
        this.current.set(key, this.currentNode);
        this.currentNode.index = parent.children.push(this.currentNode) - 1;
    }
    appendAttribute(sealed, attr, ...values) {
        let value = values.join("");
        let { action, state, node } = this.currentNode;

        if (action === "c") {
            if (sealed === 0) {
                let state = this.currentNode.state = this.currentNode.state || {};
                state[attr] = {
                    value: value
                };
                node.__state = state;
            }
            setAttribute(node, attr, value);
        } else if (sealed === 0) {
            let state = this.currentNode.state = this.currentNode.state || {};
            let old = state[attr];
            if (old.value != value) {
                old.value = value;
                setAttribute(node, attr, value);
            }
        }
    }
    appendEvent(event, handler, scope) {
        let { node, action } = this.currentNode;
        let events = node.__events = node.__events || {};
        if (action === 'c') {
            events[event] = { handler, scope };
            createEvent(node, event, handler);
        }
        else {
            events[event].scope = scope;
        }
    }
    createNodes(target) {
        let domParents = [];

        for (let [key, value] of this.created) {
            let { node, parentKey, children } = value;
            children.forEach(child => {
                append(node, child.node, child.next);
                child = null;
            });
            if (!this.created.get(parentKey)) {
                domParents.push(value);
            }
        }
        domParents.forEach(item => {
            let { node, parent } = item;
            if (parent.node) {
                append(parent.node, node, item.next);
            } else {
                append(this.target, node, item.next);
            }
        });
    }
    removeEvents(node) {
        let events = node.__events;
        if (events) {
            for (let key in events) {
                let { handler, scope } = events[key];
                removeEvent(node, key, handler);
            }
            node.__events = null;
        }
    }
    removeNodes() {
        let domParents = [];
        this.last.delete("0.0.0.target");
        for (let [key, value] of this.last) {
            let { node, parentKey } = value;
            this.removeEvents(node);
            if (!this.last.get(parentKey)) {
                domParents.push(node);
            }
        }
        domParents.forEach(node => {
            remove(node);
        });
    }
    close() {
        this.removeNodes();
        this.createNodes();
        this.last = null;
        this.current = null;
        this.default = null;
        this.currentNode = null;
        this.created = null;
        this.target = null;
    }
}

module.exports.VDom = VDom;
