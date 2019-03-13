const t = require('@babel/types');
const {createMeta}=require('./meta');
const {VDOM,ANCHOR,GENERATESTRING,ZERO,SCOPE} = require('./constans');
const EACH_INDEX = 'each'

//anchor
function generateAnchor(id) {
    return GENERATESTRING(`anchor${id}`);
}
function generateVDomAnchor(anchor) {
    let anchorcall = t.callExpression(
        t.memberExpression(VDOM, ANCHOR),
        [anchor.key]
    );
    createMeta(anchorcall,{anchor:anchor});
    return t.expressionStatement(anchorcall);
}
//block each
function generateEach(path) {
    return path.scope.generateUidIdentifier(
        EACH_INDEX
    );
}
function generateVariableEach(each) {
    return t.variableDeclarator(each, ZERO);
}
    
function generateMemberScope(node){
    return t.memberExpression(SCOPE, node);
}
function generateUpdateEach(each){
   return t.updateExpression("++", each);
}
function generateGlobalVar(variables){
    return t.variableDeclaration("var", variables);
}
function generateArrayExpression(items){
    return t.arrayExpression(items)
}
module.exports={
    anchor:{
        generateAnchor,
        generateVDomAnchor,
    },
    visitor:{
        generateEach,
        generateVariableEach,
        generateMemberScope,
        generateUpdateEach,
        generateGlobalVar
    },
    generateArrayExpression
}