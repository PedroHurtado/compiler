const t = require('@babel/types');
const { createMeta, getMeta, getNodeMeta, getFunctionName } = require('./helper/meta');
const visitorEvents = require('./helper/events/visitorevents');
const appendEvent = require('./helper/events/transformevents');
const output = require('./helper/transforoutput');
const {
    transformAppend,
    transformText,
    transformAttribute
} = require('./helper/transform');

const {
    generateEach,
    generateVariable,
    generateMemberScope,
    generateUpdateVar,
    generateSubKey
} = require('./helper/generators').visitor;

const { NULL } = require('./helper/constans');

const {
    APPEND,
    APPPENDCOMPONENT,
    APPENDATTRIBUTE,
    APPENDEVENT,
    APPENDTEXT,
    STYLE,
    ANCHOR,
    FOREACH,
    OUTPUT,
    HTML
} = require('./helper/reservedwords');

function isScopeIdentifier(globlaScope, name, key) {
    return (
        !globlaScope.has(name) &&
        name !== '$' &&
        (key != 'property' && key != 'key')
    );
}


const visitorBlock = {
    BlockStatement: {
        enter(path) {
            let { node } = path;
            createMeta(node, this);
            this.incrementEach = false;
        }
    }
};

const visitor = {
    CallExpression: {
        enter(path) {
            let { node } = path;
            let name = getFunctionName(node.callee);
            if (name === FOREACH) {
                let { block, each } = getMeta(path);
                let newEach = generateEach(path);
                this.variables.push(generateVariable(newEach));
                if (!each) {
                    createMeta(node, { block: block });
                    path.traverse(visitorBlock, {
                        each: newEach,
                        incrementEach: true
                    });
                } else {
                    let subKey = generateSubKey(path);
                    createMeta(node, { block: block, subKey: subKey });
                    this.variables.push(generateVariable(subKey));
                    path.traverse(visitorBlock, {
                        each: newEach,
                        incrementEach: true,
                        subKey: subKey
                    });
                }

            }
        },
        exit(path) {
            let { block, anchor, each } = getMeta(path);
            if (anchor) {
                anchor.block = block;
            }
            let node = path.node;
            let args = node.arguments;
            let name = getFunctionName(node.callee);

            if (name === APPEND || name === APPPENDCOMPONENT) {
                node.arguments = transformAppend(args, block);
                path.skip();
            } else if (name === APPENDTEXT || name === HTML) {
                node.arguments = transformText(args, block);
                path.skip();
            } else if (name === APPENDATTRIBUTE || name === STYLE) {
                node.arguments = transformAttribute(args);
                path.skip();
            } else if (name === FOREACH) {
                let { subKey } = getNodeMeta(node);
                if (subKey) {
                    this.globalScope.add(subKey.name);
                    path.insertAfter(generateUpdateVar(subKey));
                }
                path.skip();
            } else if (name === APPENDEVENT) {
                let scope = { node: node, keys: new Set() };
                path.traverse(visitorEvents, scope);
                let { _arguments, statements } = appendEvent(path, args, scope.keys);
                this.events.push(...statements);
                node.arguments = _arguments;
                path.skip();
            } else if (name === OUTPUT) {
                let { _arguments, statements } = output(path, args);
                this.events.push(...statements);
                node.arguments = _arguments;
                path.skip();
            }
        }
    },
    Identifier(path) {
        Object.keys(path.scope.bindings).forEach(name => {
            this.globalScope.add(name);
        });
        let { node, key, parent } = path;
        let { name } = node;
        if (isScopeIdentifier(this.globalScope, name, key)) {
            path.skip();
            path.replaceWith(generateMemberScope(node));
        }
    },
    BlockStatement: {
        enter(path) {
            let block = this.block.enter();
            let { node } = path;
            let { each, subKey } = getNodeMeta(node);
            block.each = each;
            block.subKey = subKey;
            createMeta(node, { block: block });
        },
        exit(path) {
            let { each, block, anchor, incrementEach } = getNodeMeta(path.node);
            if (each && incrementEach) {
                let { body } = path.node;
                body.push(generateUpdateVar(each));
                path.skip();
            }
        }
    },
};
module.exports = visitor;
