
const template = require('@babel/template');
const t = require('@babel/types');
const { SCOPE } = require('./constans')

module.exports = function transformCreateVDom() {
    let templateContent = `
            var vdom = new VDom($);
            `
    let mapObject = {
        $: SCOPE
    }
    let _template = template.statements(templateContent);
    return _template(mapObject);
}

