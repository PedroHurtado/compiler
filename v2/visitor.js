const t = require('@babel/types');

const GENERATENUMERIC = (number) => t.numericLiteral(number)
const SCOPE = t.identifier('$');
const SEALED = t.numericLiteral(1);
const NOTSEALED = t.numericLiteral(0);
const ISSEALDED = (sealed) => !!sealed ? NOTSEALED : SEALED;
const GENERATEIDENTIFIER = (identifier) => t.identifier(identifier);


let globalBindings = ['render', 'append', 'appendAttribute', 'appendEvent', 'appendText', 'target', 'vdom']
let bindings = new Set([...globalBindings,
...Object.getOwnPropertyNames(Array),
...Object.getOwnPropertyNames(Array.prototype),
...Object.getOwnPropertyNames(Object.prototype),
...Object.getOwnPropertyNames(Object),
]);


const getNodeType = function (callee) {
    if (t.isIdentifier(callee)) {
        return callee.name;
    } else if (t.isMemberExpression(callee)) {
        return callee.property.name;
    }
}
function hasExpression(args) {
    let exp = args.filter(c => {
        return c.type.indexOf('Literal') === -1
    })
    return ISSEALDED(exp.length);
}
function replaceArguments(path, node, newArgs) {
    path.skip();
    node.arguments = newArgs;
}

function replaceText(args, path, node, update,nodeIndex,currentBlock) {
    let keyIndex = update || GENERATENUMERIC(nodeIndex)
    let sealed = hasExpression(args);
    let newArgs = [GENERATENUMERIC(currentBlock), keyIndex, sealed, ...args];
    replaceArguments(path, node, newArgs);
}


function replaceAppend(args, path, node, update,nodeIndex,currentBlock) {
    let keyIndex = update || GENERATENUMERIC(nodeIndex)
    let newArgs = [GENERATENUMERIC(currentBlock), keyIndex, ...args];
    replaceArguments(path, node, newArgs);
}
function replaceAttribute(args, path, node) {
    let sealed = hasExpression(args);
    let newArgs = [sealed, ...args];
    replaceArguments(path, node, newArgs);
}
function replaceIdentifier(bindings, name, key) {
    return !bindings.has(name)
        && name !== '$'
        && name.indexOf('click_handler') === -1
        && key != "property"
}
function checkUpdate(path) {
    //work arround;
    return path.parentPath.parentPath.data.update;
}
const visitor = {
    CallExpression: {
        enter: function (path) {
            let { node } = path;
            let name = getNodeType(node.callee);
            if (name === 'forEach') {
                this.blockEach = true;
            }
        },
        exit: function (path) {
            let node = path.node;
            let args = node.arguments;
            let name = getNodeType(node.callee);
            if (name === 'append') {
                this.nodeIndex++;
                replaceAppend(args, path, node, checkUpdate(path),this.nodeIndex,this.currentBlock);
            } else if (name === 'appendText') {
                this.nodeIndex++
                replaceText(args, path, node, checkUpdate(path),this.nodeIndex,this.currentBlock);
            } else if (name === 'appendAttribute') {
                replaceAttribute(args, path, node);
            } else if (name === 'appendEvent') {


            }
        }
    },
    Identifier(path) {
        Object.keys(path.scope.bindings)
            .forEach(name => {
                bindings.add(name)
            });
        let { name } = path.node;
        let key = path.key;
        if (replaceIdentifier(bindings, name, key)) {
            let member = t.memberExpression(SCOPE, path.node);
            path.skip();
            path.replaceWith(member);
        }

    },
    BlockStatement: {
        enter: function (path) {
            
            if (this.blockEach) {
                let id = path.scope.generateUidIdentifier("each_index");
                let variable = t.variableDeclarator(id, t.numericLiteral(0))
                let update = t.updateExpression("++", id);
                path.node.body.unshift(update);
                this.variables.push(variable);
                bindings.add(id.name);
                path.data.update = id;
                this.blockEach = false;
            }
            this.nodeIndex = 0;
            this.currentBlock = this.blockIndex;
            this.blocks.push(this.currentBlock);
            this.blockIndex++;
        },
        exit: function () {
            this.blocks.pop();
            this.currentBlock = this.blocks[this.blocks.length - 1];
        }
    }

}
module.exports = visitor;