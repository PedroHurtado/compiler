const parse5 = require('parse5');
const fs = require('fs');
const path = require('path');
const interpolate = require('./interpolate');
const domfunctions = require('./donfunctions');
const attributes = require('./attributes');
const DomNodes=require('./domnodes');
const visitorender=require('./visitorrender');
const {VDom} = require('./vdom');

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
    node=> {
        let { tagName } = node;
        return tagName && tagName === 'style'
    }
);
let buffer = Buffer.alloc(parseInt(Math.pow(2, 15)) + 10);
let position = 0;
let map = new Map();
let domnodes = new DomNodes();


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

const hashCode = function(s){
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

const decorateItem = function(item){
    return `$$_${item}`;
}
position+=position += buffer.write(VDom.toString(), 0)

let openFunction = `const vdom = new VDom(); function render ($){`;
position += buffer.write(openFunction, position);

(function write(nodes, currentElement) {
    nodes.forEach(element => {
        let { tagName, value, attrs, childNodes } = element;
        if (tagName) {
            let item = createItem(tagName);
            let appenNode = `vdom.append('${currentElement}','${item}','${tagName}');`;
            position += buffer.write(appenNode, position);
            let processedAttributes = attributes(attrs);
            processedAttributes.forEach((attribute) => {
                let attr = attribute();
                position += buffer.write(attr, position);
            });
            if (element.childNodes && element.childNodes.length > 0) {
                write(element.childNodes, item);
            }
        }
        else if (value) {
            let str = isTextContent(value);
            if (str) {
                let item = createItem('text'),values,params;
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

let end = ' return vdom;}'
position += buffer.write(end, position)

/*
for(key in domfunctions){
    let value = domfunctions[key].toString()
    position += buffer.write(value, position);    
}
*/


//position += buffer.write(`export {render};`,position);

let newBuffer = Buffer.alloc(position);
buffer.copy(newBuffer, 0, 0, position);
let code = visitorender(newBuffer.toString('utf8'),domnodes);
{
    
    let newFilename = path.format({
        name:`./v2/${exportName}`,
        ext:'.js',
    });
    fs.writeFileSync(
        newFilename,
        code
    );
}
