const parse5 = require('parse5');
const fs = require('fs');
const path = require('path');
const interpolate = require('./interpolate');
const attributes = require('./attributes');
const parseCode = require('./parse');


let filename = './v2/x.html';
let exportName = path.parse(filename).name;
let str = fs.readFileSync(filename, 'utf-8');
let result = parse5.parse(str, { sourceCodeLocationInfo: true });
let childNodes = result.childNodes[0].childNodes[1].childNodes
let nodes = childNodes.filter(
    node => {
        let { tagName, value } = node;
        return value || (tagName && tagName !== 'script' && tagName !== 'style');
    }
);
let script = childNodes.filter(
    node => {
        let { tagName } = node;
        return tagName && tagName === 'script'
    }
);
let style = childNodes.filter(
    node => {
        let { tagName } = node;
        return tagName && tagName === 'style'
    }
);

let map = new Map();



function createItem(tag) {
    if (value = map.get(tag)) {
        let newtag = `${tag}${value}`
        let newValue = value + 1
        map.set(tag, newValue);
        return newtag;
    }
    else {
        map.set(tag, 1)
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

let buffer = Buffer.alloc(parseInt(Math.pow(2, 15)) + 10);
let position = 0;

position += buffer.write(`import { VDom, define, decorate } from './dom/index.js'`, position)
if (script.length > 0) {
    let [chilNode] = script[0].childNodes;
    let value = chilNode.value;
    if (value) {
        position += buffer.write(value, position);
    }
}

let openFunction = `function render ($){ 
    var first = $.first;
    var target = $.target || $;
    var vdom = new VDom(first,target);`;
position += buffer.write(openFunction, position);

(function write(nodes, currentElement) {
    nodes.forEach(element => {
        let { tagName, value, attrs, childNodes } = element;
        if (tagName) {
            let item = createItem(tagName);
            if (isWebComponent(element)) {
                let appenNode = `vdom.appendComponent('${currentElement}','${item}','${tagName}');`;
                position += buffer.write(appenNode, position);
                let {processed,properties} = attributes(attrs,true);
                processed.forEach((attribute) => {
                    position += buffer.write(attribute, position);
                });
                if(properties){
                    position+=buffer.write(`vdom.inputs(${properties});`,position);
                }else{
                    position+=buffer.write(`vdom.inputs(null);`,position);
                }

            }
            else {
                let appenNode = `vdom.append('${currentElement}','${item}','${tagName}');`;
                position += buffer.write(appenNode, position);
                let {processed} = attributes(attrs);
                processed.forEach((attribute) => {
                    position += buffer.write(attribute, position);
                });
            }
            if (element.childNodes && element.childNodes.length > 0) {
                write(element.childNodes, item);
            }
            position += buffer.write('vdom.closeElement();', position);
        }
        else if (value) {
            let str = isTextContent(value);
            if (str) {
                let item = createItem('text'), values, params;
                values = interpolate(str);
                params = values.map(c => c.expression ? c.text : `'${c.text}'`).join(', ')

                let callExpression = `vdom.appendText('${currentElement}','${item}', ${params});`;

                position += buffer.write(callExpression, position);
            }
            else {
                str = value;
                position += buffer.write(str, position)
            }
        }

    });
}(nodes, 'target'));

let end = ' vdom.close(); vdom=null}'
position += buffer.write(end, position)


//position += buffer.write(`export {render};`,position);

let newBuffer = Buffer.alloc(position);
buffer.copy(newBuffer, 0, 0, position);
let code = parseCode(newBuffer.toString('utf8'));
{

    let newFilename = path.format({
        name: `./v2/${exportName}`,
        ext: '.js',
    });
    fs.writeFileSync(
        newFilename,
        code
    );
}
