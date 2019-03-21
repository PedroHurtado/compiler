const visitor = require('./visitor');
const Block = require('./helper/block')
const globalScope = require('./helper/globalscope');
const { generateGlobalVar } = require('./helper/generators').visitor;
const t = require('@babel/types');

const visitorRender = {
    FunctionDeclaration(path) {
        let { node } = path;
        let { name } = node.id;
        if (name === 'render') {
            let { body } = node.body
            let scope = {
                variables: [],
                block: new Block(),
                globalScope: new Set(globalScope),
                events: [],
            }
            path.traverse(visitor, scope)
            path.stop();
            if (scope.events.length) {
                body.unshift(...scope.events);
            }
            if (scope.variables.length) {
                body.unshift(generateGlobalVar(scope.variables));
            }

        }
    },
    ClassDeclaration(path) {
        const { node: { id } } = path;
        let define = t.callExpression(
            t.identifier("define"),
            [id]
        );
        let decorate = t.callExpression(
            t.identifier("decorate"),
            [id,t.identifier('render')]
        );
        path.insertAfter(t.expressionStatement(define));
        path.insertAfter(t.expressionStatement(decorate));
    }
}

module.exports = visitorRender