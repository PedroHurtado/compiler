const t = require('@babel/types');
const traverse = require('@babel/traverse').default;
const parser = require('@babel/parser').parse;
let shadow = false;
const visitor = {
    ClassMethod(path) {
        let { node } = path;
        let { kind, static, key:{name}} = node;
        if(kind==='get' && static && name === 'shadow'){
            shadow = true;
            path.stop();
        }
    }
}
function hasShadow(code) {
    shadow = false;
    let ast = parser(code, {
        sourceType: 'module'
    });
    traverse(ast, visitor);
    return shadow;
}
module.exports = {
    hasShadow
}