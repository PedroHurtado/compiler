const interpolate = require('./interpolate');



const reserved = {
    'on': (parent,handler,event) => {
        return function () {
            return `appendEvent(${parent},'${event}',${handler});`     
        }
    },
    'default': (parent, value, name) => {
        return function () {
            return `appendAttribute(${parent},'${name}',${value});`;
           
        }
    }
}
function isReserved(array) {
    return array.length > 1;
}
function getParameters(params) {
    return params.map(c => c.expression ? c.text : `'${c.text}'`).join(' ,');
}
module.exports = function attributes(element, attrs) {
    let processed = [];
    attrs.forEach(attr => {
        let name = attr.name.split(':').map(c => c.trim());
        let value = interpolate(attr.value);
        if (isReserved(name)) {
            processed.push(reserved[name[0]](element, value[0].text, name[1]));
        }
        else {
            processed.push(reserved['default'](element, getParameters(value), name[0]));
        }
    });
    return processed;
}