const t = require('@babel/types');

const GENERATENUMERIC = (number) => t.numericLiteral(number)
const SCOPE = t.identifier('$');
const SEALED = GENERATENUMERIC(1);
const NOTSEALED = GENERATENUMERIC(0);
const RESEOLVESEALDED = (sealed) => sealed ? SEALED : NOTSEALED;
const GENERATEIDENTIFIER = (identifier) => t.identifier(identifier);


let globalBindings = ['render', 'append', 'appendAttribute', 'appendEvent', 'appendText', 'target']
let bindings = new Set([...globalBindings,
...Object.getOwnPropertyNames(Array),
...Object.getOwnPropertyNames(Array.prototype),
...Object.getOwnPropertyNames(Object.prototype),
...Object.getOwnPropertyNames(Object),
]);

let blockIndex = 0;
let nodeIndex = 0;
const getNodeType = function (callee) {
    if (t.isIdentifier(callee)) {
        return callee.name;
    } else if (t.isMemberExpression(callee)) {
        return callee.property.name;
    }
}
function hasExpression(args, start) {
    //2 suppress tag and parent arguments
    let exp = args.slice(star).filter(c => {
        return c.type.indexOf('Literal') === -1
    })
    return RESEOLVESEALDED(exp.length);
}
function replaceArguments(args, path, node) {
    let sealed = hasExpression(args, 1);
    let newArgs = [GENERATENUMERIC(blockIndex), sealed, GENERATENUMERIC(nodeIndex), ...args];
    path.skip();
    node.arguments = newArgs;
}
function replaceIdentifier(bindings, name, key) {
    return !bindings.has(name)
        && name !== '$'
        && name.indexOf('click_handler') === -1
        && key != "property"
}
const visitor = {
    CallExpression() {
        exit: function(path) {
            let node = path.node;
            let args = node.arguments;
            let name = getNodeType(node.callee);
            if (name === 'append') {
                nodeIndex++;
                replaceArguments(args, path, node);
            } else if (name === 'appendText') {
                nodeIndex++;
                replaceArguments(args, path, node);
            } else if (name === 'appendAttribute') {
                replaceArguments(args, path, node);
            } else if (name === 'appendEvent') {


            }
        }
    },
    Identifier(path) {
        Object.keys(path.scope.bindings)
            .filter(name => name.indexOf('$$_') === -1)
            .forEach(name => {
                bindings.add(name)
            });
        let { name } = path.node;
        let key = path.key;
        if (name.indexOf('$$_') > -1) {
            path.node.name = name.replace('$$_', '');
        } else if replaceIdentifier(bindings, name, key)   
        {
            let member = t.memberExpression(t.identifier('$'), path.node);
            path.skip();
            path.replaceWith(member);
        }

    }
    BlockStatement: {
        enter: function () {
            blockIndex++;
        }
    }

}


