const visitor = require('./visitor');
const Block = require('./helper/block')
const Anchor = require('./helper/anchor');
const globalScope = require('./helper/globalscope');
const { generateGlobalVar } = require('./helper/generators').visitor

const visitorRender = {
    FunctionDeclaration(path) {
        let { node } = path;
        let { name } = node.id;
        if (name === 'render') {
            let scope = {
                variables: [],
                block: new Block(),
                anchor: new Anchor(),
                globalScope: new Set(globalScope)
            }
            path.traverse(visitor, scope)
            path.stop();
            if (scope.variables.length) {
                let { body } = node.body
                body.unshift(generateGlobalVar(scope.variables));
            }

        }
    }
}

module.exports = visitorRender