const interpolate = require("./interpolate");
const styleAttribute = require('./styleattribute');
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
  d: (name, value) => {
    return `vdom.directive('${name}',${value});`
  },
  ref: (name) => {
    return `vdom.ref('${name}');`
  },
  style: (value, name) => {
    return `vdom.style('${name}',${value});`;
  },
  default: (value, name) => {
    return `vdom.appendAttribute('${name}',${value});`
  }
};
function isReserved(array) {
  return array.length > 1;
}
function getParameters(params) {
  return params.map(c => (c.expression ? c.text : `'${c.text}'`)).join(" ,");
}
module.exports = function attributes(attrs) {
  let processed = [];
  let properties = [];
  Object.entries(attrs)
    .map(([name, value]) => ({name, value}))
    .forEach(attr => {
    if (attr.name !== 'is') {
      if (attr.name === 'style') {
        let styles = styleAttribute(attr.value);
        styles.forEach(s => {
          let value = interpolate(s[1]);
          processed.push(reserved['style'](getParameters(value), s[0]));
        })
      } else {
        let name = attr.name.split(":").map(c => c.trim());
        let value = interpolate(attr.value);
        if (isReserved(name)) {
          if (name[0] === 'in') {
            properties.push(reserved[name[0]](name[1], getParameters(value)));
          } else if (name[0] === 'ref') {
            processed.push(reserved[name[0]](name[1]));
          } else if (name[0] === 'd') {
            processed.push(reserved[name[0]](name[1], attr.value));
          } else {
            processed.push(reserved[name[0]](value[0].text, name[1]));
          }
        } else {
          processed.push(reserved['default'](getParameters(value), name[0]));
        }
      }
    }
  });
  return { processed, properties: properties.join(",") };
};
