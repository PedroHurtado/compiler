const t = require('@babel/types');
const {
    META,
    createMeta,
    getMeta,
    getFunctionName } = require('./helper/meta');

const {
    transformAppend,
    transformAnchor,
    transformText,
    transformAttribute
} = require('./helper/transform');

const {
    generateEach,
    generateVariableEach,
    generateMemberScope,
    generateUpdateEach
} = require('./helper/generators').visitor

const { NULL } = require('./helper/constans');

const {
    APPEND,
    APPENDATTRIBUTE,
    APPENDEVENT,
    APPENDTEXT,
    ANCHOR,
    FOREACH
} = require("./helper/reservedwords");


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
            this.incrementEach = false;
        }
    }
}

const visitor = {
    CallExpression: {
        enter(path) {
            let { node } = path;
            let name = getFunctionName(node.callee);
            if (name === FOREACH) {
                let { block } = getMeta(path);
                let each = generateEach(path)
                let anchor = this.anchor.enter();
                anchor.parentBlock = block;
                createMeta(node, { anchor: anchor, block: block });
                this.variables.push(
                    generateVariableEach(each)
                );
                path.traverse(visitorBlock, {
                    each: each,
                    anchor: anchor,
                    incrementEach :true,
                });
            }
        },
        exit(path) {
            let { block, anchor, each } = getMeta(path);
            let node = path.node;
            let args = node.arguments;
            let name = getFunctionName(node.callee);

            if (name === APPEND) {
              
                let KeyAnchor = (anchor && anchor.key) || NULL;
                node.arguments = transformAppend(
                    args,
                    block,
                    KeyAnchor
                );
                path.skip();

            } else if (name === APPENDTEXT) {
               
                let KeyAnchor = (anchor && anchor.key) || NULL;
                node.arguments = transformText(
                    args,
                    block,
                    KeyAnchor
                );
                path.skip();
            } else if (name === APPENDATTRIBUTE) {
                node.arguments = transformAttribute(args);
                path.skip();
            }
            else if (name === FOREACH) {
                let { statement } = path.node[META].anchor
                path.parentPath.insertAfter(statement);
                path.skip();
            } else if (name === ANCHOR) {
                node.arguments = transformAnchor(args, node[META]);
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
            let {each} = node[META] || {};
            block.each=each;
            createMeta(node, { block: block })
        },
        exit(path) {
            let {each, block, anchor,incrementEach } = path.node[META];
            if (each && incrementEach) {
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

