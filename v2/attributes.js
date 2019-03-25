const interpolate = require("./interpolate");
const reserved = {
  on: (handler, event) => {
    return `vdom.appendEvent('${event}',${handler});`;
  },
  in: (name, value) => {
    return `['${name}',${value}]`
  },
  out: (name, value) => {
    return `vdom.output('${value}',${name},{$});`
  },
  default: (value, name, isWebComponents) => {
    return `vdom.appendAttribute('${name}',${value});`
  }
};
function isReserved(array) {
  return array.length > 1;
}
function getParameters(params) {
  return params.map(c => (c.expression ? c.text : `'${c.text}'`)).join(" ,");
}
module.exports = function attributes(attrs, isWebComponents = false) {
  let processed = [];
  let properties = [];
  attrs.forEach(attr => {
    let name = attr.name.split(":").map(c => c.trim());
    let value = interpolate(attr.value);
    if (isReserved(name)) {
      if (name[0] === 'in') {
        properties.push(reserved[name[0]](name[1],getParameters(value)));
      } else {
        processed.push(reserved[name[0]](value[0].text, name[1]));
      }
    } else {
      processed.push(reserved['default'](getParameters(value), name[0]));
    }
  });
  return { processed, properties: properties.join(",") };
};
