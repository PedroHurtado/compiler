const t = require('@babel/types');
const visitorEvent = {
    Identifier(path) {
        let { name } = path.node;
        if (path.key === 'object' || (path.key === 0 && name != this.node)) {
            this.keys.add(name);
            let ctx = t.identifier('ctx');
            let member1 = t.memberExpression(ctx,ctx)
            let member = t.memberExpression(member1,
                path.node
            );
           
            path.skip();
            path.replaceWith(member);
        }

    }
}
module.exports = visitorEvent;