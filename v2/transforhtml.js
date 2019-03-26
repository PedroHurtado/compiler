
const parse5 = require('parse5');
const interpolate = require('./interpolate');
const attributes = require('./attributes');
const parseCode = require('./transformjs');
const Writer = require('./writer');

const DEFAULTNAMESPACE = 'http://www.w3.org/1999/xhtml'

function extractParts(ast) {
    let body = ast.childNodes[0].childNodes[1];
    let nodes = body.childNodes.filter(
        node => {
            let { tagName, value } = node;
            return value || (tagName && tagName !== 'script' && tagName !== 'style');
        }
    );
    let script = body.childNodes.filter(
        node => {
            let { tagName } = node;
            return tagName && tagName === 'script'
        }
    );
    let style = body.childNodes.filter(
        node => {
            let { tagName } = node;
            return tagName && tagName === 'style'
        }
    );
    return { nodes, script, style };
}

const visitor = function (writer, nodes) {


    let tags = new Map();



    function createItem(tag) {
        if (value = tags.get(tag)) {
            let newtag = `${tag}${value}`
            let newValue = value + 1
            tags.set(tag, newValue);
            return newtag;
        }
        else {
            tags.set(tag, 1)
            return `${tag}`;
        }
    }


    function isTextContent(text) {
        if (text) {
            let start = text.indexOf('t`')
            let end = text.indexOf('`', start + 2);
            if (start !== -1 && end != -1) {
                return text.substring(start + 2, end);
            }
        }
        return null;
    }
    function isWebComponent(node) {
        return node.tagName.indexOf("-") !== -1 ||
            node.attrs.filter(attr => attr.name === 'is').length > 0;
    }

    (function visit(nodes) {
        nodes.forEach(element => {
            let { tagName, value, attrs, childNodes, namespaceURI } = element;
            if (tagName) {
                let item = createItem(tagName);
                
                if (isWebComponent(element)) {
                    writer.write(`vdom.appendComponent('${item}','${tagName}');`)
                    let { processed, properties } = attributes(attrs, true);
                    processed.forEach((attribute) => {
                        writer.write(attribute);
                    });
                    if (properties) {
                        writer.write(`vdom.inputs([${properties}]);`);
                    } else {
                        writer.write(`vdom.inputs();`);
                    }
                }
                else {
                    let namespace = (namespaceURI === DEFAULTNAMESPACE) ? 0 : 1
                    writer.write(`vdom.append('${item}','${tagName}',${namespace});`)
                    let { processed } = attributes(attrs);
                    processed.forEach((attribute) => {
                        writer.write(attribute);
                    });
                }
                if (element.childNodes && element.childNodes.length > 0) {
                    visit(element.childNodes, item);
                }
                writer.write('vdom.closeElement();');
            }
            else if (value) {
                let str = isTextContent(value);
                if (str) {
                    let item = createItem('text'), values, params;
                    values = interpolate(str);
                    params = values.map(c => c.expression ? c.text : `'${c.text}'`).join(', ')
                    writer.write(`vdom.appendText('${item}', ${params});`);
                }
                else {
                    writer.write(value);
                }
            }

        });
    }(nodes));
}
const generateHeader = function (writer, script) {
    let imports = `import { VDom, define, decorate, getEventScope } from './dom/index.js'`;
    writer.write(imports);
    if (script.length > 0) {
        let [chilNode] = script[0].childNodes;
        let value = chilNode.value;
        if (value) {
            writer.write(value);
        }
    }
}
const openRenderFunction = function (writer) {
    writer.write(`function render ($){`);
}
const closeRenderFunction = function (writer) {
    writer.write('vdom.close();vdom=null;}')
}
module.exports = function transforHml(html) {
    let ast = parse5.parse(html);
    let writer = new Writer();
    let { nodes, script, style } = extractParts(ast);

    generateHeader(writer, script);
    openRenderFunction(writer);
    visitor(writer, nodes);
    closeRenderFunction(writer);

    return writer.code;
}