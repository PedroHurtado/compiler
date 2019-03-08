
const t = require('@babel/types');
const {
    append,
    appendAttribute,
    appendText,
    appendEvent,
    others,
    helperIF,
    helperEach } = require('./tansformhelper');
const BlockIf = require('./blockif');
const Block = require('./block');
const visitorevent = require('./visitorevents');

let globalBindings = ['render', 'append', 'appendAttribute', 'appendEvent', 'appendText', 'target']
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


const visitor = {

    ObjectPattern: {
        exit: function (path) {
            let parent = path.findParent((path) => path.isVariableDeclaration());
            if (parent) {
                let ctx = this.current;
                ctx.commands.push(
                    function () {
                        let args = [ctx, parent];
                        others(...args);
                    }
                )
            }
        }
    },
    CallExpression: {
        enter: function (path) {
            let { node } = path;
            let name = getNodeType(node.callee);
            let ctx = this.current;
            if (name === 'forEach') {
                this.blockEach = helperEach(ctx, path);
            }
        },
        exit: function (path) {
            let { node } = path;
            let name = getNodeType(node.callee);
            let ctx = this.current;
            if (name === 'append') {
                let declarator = normalizeBlock(path, ctx,this.domNodes);
                ctx.commands.push(function () {
                    let args = [ctx, path, declarator];
                    append(...args);
                });
              
            } else if (name === 'appendText') {
                let declarator = normalizeBlock(path, ctx,this.domNodes);
                ctx.commands.push(function () {
                    let args = [ctx, path, declarator];
                    appendText(...args);
                });
              
            } else if (name === 'appendAttribute') {
                ctx.commands.push(function () {
                    let args = [ctx, path];
                    appendAttribute(...args);
                });
              
            } else if (name === 'appendEvent') {
                ctx.commands.push(function () {
                    let node = path.node.arguments[0].name;
                    let scope = {node:node,keys:new Set()};
                    path.traverse(visitorevent,scope)
                    let properties = []
                    let ctxObj= t.identifier('ctx');
                    let event = t.identifier('ev');
                    let args_=[]
                    for(let key of scope.keys){
                         let identifier = t.identifier(key);
                         properties.push(t.objectProperty(identifier,identifier))   
                         args_.push(identifier)
                    }
                    let assignContext = t.assignmentExpression("=",
                        t.memberExpression(event,ctxObj),
                        t.objectExpression(properties)
                    )
                    let args = [ctx,t.expressionStatement(assignContext),args_, path];
                    appendEvent(...args);
                    path.traverse()
                });
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
        let scope = this.current && this.current.scope;
        let key = path.key;
        if (name.indexOf('$$_') > -1) {
            path.node.name = name.replace('$$_', '');
        } else if 
            (!bindings.has(name) && name !== '$' && name.indexOf('click_handler') === -1 && path.key != "property")
        ) {
            let member = t.memberExpression(t.identifier('$'), path.node);
            path.skip();
            path.replaceWith(member);
        }

    },
    IfStatement: {
        enter: function (path) {
            let node = path.node;
            let _if = t.ifStatement(node.test, t.blockStatement([]));
            if (path.key !== 'consequent' && path.key !== 'alternate') {
                this.currentIf = new BlockIf(_if, this.blockIdentifier('get_if_block'));
                this.current.ifBlocks.push(this.currentIf);
                this.ifBlocks.push(this.currentIf);
            } else {
                this.currentIf.addAlternate(_if)
            }

        },
        exit: function (path) {
            let node = path.node;
            if (path.key !== 'consequent' && path.key !== 'alternate') {
                let current = this.current;
                let _if = this.ifBlocks.pop();
                _if.test = node.test;
                this.newIfBlocks.push(_if);
                this.currentIf = this.ifBlocks[this.ifBlocks.length - 1];
                current.commands.push(
                    function () {
                        let args = [path, _if, current];
                        helperIF(...args)
                    }
                )
            } else if (path.key === 'alternate') {
                this.currentIf.testAlternate = node.test;
            }
        }
    },

    BlockStatement: {
        enter: function (path) {
            let blockName = this.blockIdentifier('block_context');
            let current = new Block(blockName);
            if (this.blockEach) { //scope forEachBlocks
                let blockEach = this.blockEach;
                let {scope,parentBlock} = this.blockEach;
                current.scope = new Set(scope);
                parentBlock.commands.push(
                    function(){
                        current.scope = null;
                        let args = [current,parentBlock,path];
                        blockEach(...args);
                    }
                );
                this.blockEach = null;
            }
            this.current = current;
            this.blocks.push(this.current);
        },
        exit: function (path) {
            let block = this.blocks.pop();
            if (path.key === 'consequent') {
                this.currentIf.blockParent = block;
                this.currentIf.addConsequent(block.identifier);
            } else if (path.key === 'alternate') {
                this.currentIf.addAlternate(block.identifier);
            }
            this.newBlocks.push(block);
            this.current = this.blocks[this.blocks.length - 1];
        }
    }
}



function normalizeBlock(path, ctx,domNodes) {
    let declarator = path.parentPath.node.id;
    ctx.parent = domNodes.getParent(declarator.name);
    ctx.hasChildren = true;
    return declarator;
}

function visit(path, domNodes, blockIdentifier) {
    let scope = {
        domNodes: domNodes,
        blocks: [],
        newBlocks: [],
        ifBlocks: [],
        newIfBlocks: [],
        blockIdentifier: blockIdentifier,
    };
    path.traverse(visitor, scope)
    return scope.newBlocks;
    
}
module.exports = visit;