const t = require('@babel/types');


const GENERATENUMERIC = (value) => t.numericLiteral(value)
const GENERATESTRING = (value) => t.stringLiteral(value)
const SCOPE = t.identifier('$');
const SEALED = t.numericLiteral(1);
const NOTSEALED = t.numericLiteral(0);
const ISSEALDED = (sealed) => !!sealed ? NOTSEALED : SEALED;
const GENERATEIDENTIFIER = (identifier) => t.identifier(identifier);
const NULLLITERAL = t.nullLiteral();
const VDOM = t.identifier('vdom');
const ANCHOR = t.identifier('anchor');
const NULL = t.nullLiteral();


let dom = new Map();

function getParent(parent, key, block) {
    let _parent = dom.get(parent);
    let value = {
        parent: [block.key.value, block.nodeIndex.value, key],
        each: block.each,
        extraEach: null
    };
    dom.set(key, value)
    if (block.each) {
        value.extraEach = [block.key, block.each, GENERATESTRING(key)];
    }
    if (!_parent) {
        return GENERATESTRING("0.0.target")
    }
    if (_parent.each) {
        let ArrayExpression = t.arrayExpression(
            _parent.extraEach
        );
        return ArrayExpression;
    }
    return GENERATESTRING(_parent.parent.join('.'));
}

function getNodeType(callee) {
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

function replaceText(args, block, anchor) {
    let [parent, key] = args;
    block.parent = parent.value;
    args[0] = getParent(parent.value, key.value, block);
    let sealed = hasExpression(args);
    let newArgs = [block.key, block.each || block.nodeIndex, anchor, sealed, ...args];
    return newArgs;
}

function replaceAppend(args, block, anchor) {
    let [parent, key] = args;
    block.parent = parent.value;
    args[0] = getParent(parent.value, key.value, block);
    let newArgs = [block.key, block.each || block.nodeIndex, anchor, ...args];
    return newArgs;
}
function replaceAttribute(args) {
    let sealed = hasExpression(args);
    let newArgs = [sealed, ...args];
    return newArgs;
}
function canReplaceIdentifier(bindings, name, key) {
    return !bindings.has(name)
        && name !== '$'
        && name.indexOf('click_handler') === -1
        && key != "property"
}
function isPrincipalIf({ key }) {
    return key !== 'consequent' && key !== 'alternate'
}

function saveAnchor(anchor) {
    let { statement } = anchor;
    statement.__infoExtra = {
        anchor: anchor.key.value,
        blockAnchor: anchor.block,
    }
    return statement;
}
function getCurrentBlock(path) {
    let {node} = path.findParent((path) => path.isBlockStatement());
    return  node.__currentBlock
}

const visitorBlock={
    BlockStatement:{
        enter(path){
            let {node} = path;
            node.__each = this.each;
        }
    }
}

const visitor = {
    CallExpression: {
        enter: function (path) {
            let { node } = path;
            let name = getNodeType(node.callee);
            if (name === 'forEach') {
                this.blockEach = true;
                this.currentAnchor = this.anchor.enter();
            }
        },
        exit: function (path) {
            let block = getCurrentBlock(path);
            let node = path.node;
            let args = node.arguments;
            let name = getNodeType(node.callee);
            if (name === 'append') {
                node.arguments = replaceAppend(
                    args,
                    block,
                    (this.currentAnchor && this.currentAnchor.key) || NULL
                );
                path.skip();
            } else if (name === 'appendText') {
                node.arguments = replaceText(
                    args,
                    block,
                    (this.currentAnchor && this.currentAnchor.key) || NULL
                );
                path.skip();
            } else if (name === 'appendAttribute') {
                node.arguments = replaceAttribute(args);
                path.skip();
            }
            else if (name === 'forEach') {
                //let statement = saveAnchor(this.currentAnchor);
                //path.parentPath.insertAfter(statement);
                //this.currentAnchor = null;
                //path.skip();

            } else if (name === 'anchor') {
                let { __infoExtra } = path.parent;
                let { anchor, blockAnchor } = __infoExtra;
                let parent = getParent(blockAnchor.parent.value, anchor, blockAnchor)
                node.arguments = [
                    block.key,
                    GENERATENUMERIC(0),
                    ...args,
                    parent
                ];
                path.skip();
            } else if (name === 'appendEvent') {


            }
        }
    },
    Identifier(path) {
        Object.keys(path.scope.bindings)
            .forEach(name => {
                this.scope.add(name)
            });
        let { name } = path.node;
        let key = path.key;
        if (canReplaceIdentifier(this.scope, name, key)) {
            let member = t.memberExpression(SCOPE, path.node);
            path.skip();
            path.replaceWith(member);
        }

    },
    BlockStatement: {
        enter: function (path) {
            let block = this.block.enter();
            let { node } = path;
            node.__currentBlock = block;
            if(node.__each){
                block.each = node.__each;
            }
            if (this.blockEach && !node.__each) {
                let id = path.scope.generateUidIdentifier("each_index");
                let variable = t.variableDeclarator(id, t.numericLiteral(0))
                this.variables.push(variable);
                block.each = id;
                path.traverse(visitorBlock,{each:block.each,block:block})
                this.blockEach = false;
            }
        },
        exit: function (path) {
            let {__currentBlock,__each} =  path.node;
            if (this.currentAnchor) {
                this.currentAnchor.block = __currentBlock
            }
            let { each } = __currentBlock;
            if (each && !__each) {
                let { body } = path.node;
                let incremental = t.updateExpression("++", each);
                body.push(incremental);
                path.skip();
            }
        }
    },
    IfStatement: {
        enter: function (path) {
            if (isPrincipalIf(path)) {
                this.currentAnchor = this.anchor.enter();
            }
        },
        exit: function (path) {
            if (isPrincipalIf(path)) {
                let statement = saveAnchor(this.currentAnchor);
                path.insertAfter(statement);
                this.currentAnchor = null;
            }
        }
    }

}
module.exports = visitor;

