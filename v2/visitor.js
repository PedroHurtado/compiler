const t = require('@babel/types');
const {
    META,
    createMeta,
    getMeta,
    getFunctionName } = require('./helper/meta');

const {
    transformAppend,
    transformAnchors,
    transformText,
    transformAttribute
} = require('./helper/transform');

const {
    generateEach,
    generateVariableEach,
    generateMemberScope,
    generateUpdateEach
} = require('./helper/generators').visitor

const {NULL} = require('./helper/constans');

function isScopeIdentifier(globlaScope, name, key) {
    return !globlaScope.has(name)
        && name !== '$'
        && name.indexOf('click_handler') === -1
        && key != "property"
}
function isPrincipalIf({ key }) {
    return key !== 'consequent' && key !== 'alternate'
}

const visitorBlock = {
    BlockStatement: {
        enter(path) {
            let { node } = path;
            createMeta(node, this)
            if (this.first) {
                this.first = false;
            }
        }
    }
}

const visitor = {
    CallExpression: {
        enter(path) {
            let { node } = path;
            let name = getFunctionName(node.callee);
            if (name === 'forEach') {
                let { block, each } = getMeta(path);
                let anchor = this.anchor.enter();
                anchor.parentBlock = block;
                createMeta(node, { anchor: anchor, block: block });
                if (!each) {
                    let newEach = generateEach(path)
                    this.variables.push(
                        generateVariableEach(newEach)
                    );
                    block.each = newEach;
                    path.traverse(visitorBlock, {
                        each: newEach,
                        anchor: anchor,
                        first: true
                    });
                } else {
                    path.traverse(visitorBlock, {
                        each: each,
                        anchor: anchor,
                        first: false
                    });
                }
            }
        },
        exit(path) {
            let { block, anchor, each } = getMeta(path);
            let node = path.node;
            let args = node.arguments;
            let name = getFunctionName(node.callee);

            if (name === 'append') {
                let KeyAnchor = (anchor && anchor.key) || NULL;
                node.arguments = transformAppend(
                    args,
                    block,
                    KeyAnchor
                );
                path.skip();
            } else if (name === 'appendText') {
                let KeyAnchor = (anchor && anchor.key) || NULL;
                node.arguments = transformText(
                    args,
                    block,
                    KeyAnchor
                );
                path.skip();
            } else if (name === 'appendAttribute') {
                node.arguments = transformAttribute(args);
                path.skip();
            }
            else if (name === 'forEach') {
                let { statement } = path.node[META].anchor
                path.parentPath.insertAfter(statement);
                path.skip();

            } else if (name === 'anchor') {
                node.arguments = transformAnchors(args, node[META]);
            } else if (name === 'appendEvent') {


            }
        }
    },
    Identifier(path) {
        Object.keys(path.scope.bindings)
            .forEach(name => {
                this.globalScope.add(name)
            });
        let { node, key } = path;
        let { name } = node;
        if (isScopeIdentifier(this.globalScope, name, key)) {
            path.skip();
            path.replaceWith(
                generateMemberScope(node)
            );
        }

    },
    BlockStatement: {
        enter(path) {
            let block = this.block.enter();
            let { node } = path;
            createMeta(node, { block: block })
        },
        exit(path) {
            let { first, each, block, anchor } = path.node[META];
            if (first && each) {
                let { body } = path.node;
                body.push(generateUpdateEach(each));
                path.skip();
            }
            if (anchor) {
                anchor.block = block;
            }

        }
    },
    IfStatement: {
        enter(path) {
            if (isPrincipalIf(path)) {
                let { node } = path;
                let { block } = getMeta(path)
                let anchor = this.anchor.enter();
                anchor.parentBlock = block;
                createMeta(node, { anchor: anchor, block: block })
                path.traverse(visitorBlock, { anchor: anchor });
            }
        },
        exit(path) {
            if (isPrincipalIf(path)) {
                let { statement } = path.node[META].anchor
                path.insertAfter(statement);
            }
        }
    }

}
module.exports = visitor;

