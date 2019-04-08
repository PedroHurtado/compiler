const parse5 = require("parse5");
const dom5 = require('dom5');
const interpolate = require("./interpolate");
const attributes = require("./attributes");
const parseCode = require("./transformjs");
const {generateCSS} = require('./css');
const Writer = require("./writer");
const parseText = require("./parsetext");
const htmlparser2Adapter = require('parse5-htmlparser2-tree-adapter');
const {hasShadow} = require('./hasshadow');

const TEXTJS = "j";
const TEXT = "t";
const HTML = "html";

const DEFAULTNAMESPACE = "http://www.w3.org/1999/xhtml";

function extractParts(ast) {
  let body = ast.childNodes[0].childNodes[1];
  let nodes = body.childNodes.filter(node => {
    let { tagName, nodeValue } = node;
    return nodeValue || (tagName && tagName !== "script" && tagName !== "style");
  });
  let script = body.childNodes.filter(node => {
    let { tagName } = node;
    return tagName && tagName === "script";
  });
  let style = body.childNodes.filter(node => {
    let { tagName } = node;
    return tagName && tagName === "style";
  });
  return { nodes, script, style };
}

const visitor = function (writer, nodes) {
  let tags = new Map();

  function createItem(tag) {
    if ((value = tags.get(tag))) {
      let newtag = `${tag}${value}`;
      let newValue = value + 1;
      tags.set(tag, newValue);
      return newtag;
    } else {
      tags.set(tag, 1);
      return `${tag}`;
    }
  }

  function isWebComponent(node) {
    return (
      node.tagName.indexOf("-") !== -1 ||
      Object.keys(node.attribs).filter(attr => attr.name === "is").length > 0
    );
  }

  (function visit(nodes) {
    nodes.forEach(element => {
      let { tagName, nodeValue, attribs, childNodes, namespace } = element;
      if (tagName) {
        let item = createItem(tagName);

        if (isWebComponent(element)) {
          writer.write(`vdom.appendComponent('${item}','${tagName}');`);
          let { processed, properties } = attributes(attribs, true);
          processed.forEach(attribute => {
            writer.write(attribute);
          });
          if (properties) {
            writer.write(`vdom.inputs([${properties}]);`);
          } else {
            writer.write(`vdom.inputs();`);
          }
        } else {
          let namespaceURI = namespace === DEFAULTNAMESPACE ? 0 : 1;
          writer.write(`vdom.append('${item}','${tagName}',${namespaceURI});`);
          let { processed } = attributes(attribs);
          processed.forEach(attribute => {
            writer.write(attribute);
          });
        }
        if (element.childNodes && element.childNodes.length > 0) {
          visit(element.childNodes, item);
        }
        writer.write("vdom.closeElement();");
      } else if (nodeValue) {
        let statements = parseText(nodeValue);
        statements.forEach(statement => {
          let { type, text } = statement;
          if (type === TEXTJS) {
            writer.write(text);
          } else {
            let values = interpolate(text);
            let params = values
              .map(c => (c.expression ? c.text : `'${c.text}'`))
              .join(", ");
            if (type === TEXT) {
              let item = createItem("text");
              writer.write(`vdom.appendText('${item}', ${params});`);
            } else if (type === HTML) {
              let item = createItem("noscript");
              writer.write(`vdom.html('${item}',${params});`);
            }
          }
        });
      }
    });
  })(nodes);
};
const generateHeader = function (writer, script) {
  let imports = `import { VDom, define, decorate, getEventScope } from './dom/index.js'`;
  writer.write(imports);
  if (script.length > 0) {
    let [chilNode] = script[0].childNodes;
    let value = chilNode.nodeValue;
    if (value) {
      writer.write(value);
    }
  }
};
const openRenderFunction = function (writer) {
  writer.write(`function render ($){`);
};
const closeRenderFunction = function (writer) {
  writer.write("vdom.close();vdom=null;}");
};
module.exports = async function transforHml(html, file) {
  let ast = parse5.parse(html, {treeAdapter: htmlparser2Adapter});
  let writer = new Writer();
  let { nodes, script, style } = extractParts(ast);
  let scriptCode= script[0].children[0].data;
  let usePrefix =  !hasShadow(scriptCode);
  const {css} = await generateCSS(style, file, nodes, usePrefix);
  // TODO: guardar css en un estatico del script
  generateHeader(writer, script);
  openRenderFunction(writer);
  visitor(writer, nodes);
  closeRenderFunction(writer);

  return writer.code;
};
