const t = require('@babel/types');
const visitorEvent = {
    Identifier(path) {
        let { name } = path.node;
        if ((path.key === 'object' && name!='vdom') || (path.key === 0 && name != this.node)) {
            this.keys.add(name);
        }

    }
}
module.exports = visitorEvent;