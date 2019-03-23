const parse5 = require('parse5');
const fs = require('fs');
const path = require('path');
const interpolate = require('./interpolate');
const attributes = require('./attributes');
const parseCode = require('./parse');
const Writer = require('./writer');

let writer = new Writer();


let filename = './v2/x.html';
let exportName = path.parse(filename).name;
let str = fs.readFileSync(filename, 'utf-8');
let result = parse5.parse(str);
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


let imports = `import { VDom, define, decorate, getEventScope } from './dom/index.js'`;
writer.write(imports);
if (script.length > 0) {
    let [chilNode] = script[0].childNodes;
    let value = chilNode.value;
    if (value) {
        writer.write(value);
    }
}
writer.write(`function render ($){`);


(function visit(nodes) {
    nodes.forEach(element => {
        let { tagName, value, attrs, childNodes } = element;
        if (tagName) {
            let item = createItem(tagName);
            if (isWebComponent(element)) {
                writer.write(`vdom.appendComponent('${item}','${tagName}');`)
                let {processed,properties} = attributes(attrs,true);
                processed.forEach((attribute) => {
                    writer.write(attribute);
                });
                if(properties){
                    writer.write(`vdom.inputs(${properties});`);
                }else{
                    writer.write(`vdom.inputs(null);`);
                }
            }
            else {
                writer.write(`vdom.append('${item}','${tagName}');`)
                let {processed} = attributes(attrs);
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

writer.write('vdom.close();vdom=null;}')



let code = parseCode(writer.code);
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
