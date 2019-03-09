class VDom {
    constructor() {
        this.last = new Map();
        this.current = new Map();
        this.currentNode;
    }

    generateKey(block, key, tagKey) {
        return `${block.toString().padStart(3, '0')}.${key.toString().padStart(4, '0')}.${tagKey}`;
    }

    createCurrentNode(key, tag) {
        return this.last.get(key) || {
            tag: tag,
            action: 'c',
            state: {}
        };
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
        }
    }

    appendText(block, key, sealed, parent, tagKey, ...value) {
        let _key = this.generateKey(block, key, tagKey);

        this.currentNode = this.createCurrentNode(_key, 'text');
        let {
            action,
            state
        } = this.currentNode;

        if (action === 'c') {
            state.text = {
                value: value.join(''),
                sealed: sealed
            };
            this.current.set(_key, this.currentNode);
        }
    }

    appendAttribute(sealed,attr,...value) {
        let {
            action,
            state
        } = this.currentNode;

        if (action === 'c') {
            state[attr] = {
                value: value.join(''),
                sealed: sealed
            };
        }
    }
    appendEvent() {

    }

}

module.exports.VDom = VDom;