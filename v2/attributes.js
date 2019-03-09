const interpolate = require('./interpolate');



const reserved = {
    'on': (handler,event) => {
        return function () {
            return `vdom.appendEvent('${event}',${handler});`     
        }
    },
    'default': (value, name) => {
        return function () {
            return `vdom.appendAttribute('${name}',${value});`;
           
        }
    }
}
function isReserved(array) {
    return array.length > 1;
}
function getParameters(params) {
    return params.map(c => c.expression ? c.text : `'${c.text}'`).join(' ,');
}
module.exports = function attributes(attrs) {
    let processed = [];
    attrs.forEach(attr => {
        let name = attr.name.split(':').map(c => c.trim());
        let value = interpolate(attr.value);
        if (isReserved(name)) {
            processed.push(reserved[name[0]](value[0].text, name[1]));
        }
        else {
            processed.push(reserved['default'](getParameters(value), name[0]));
        }
    });
    return processed;
}