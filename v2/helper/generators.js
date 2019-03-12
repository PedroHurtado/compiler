const t = require('@babel/types');
const {createMeta}=require('./meta');
const {VDOM,ANCHOR,GENERATESTRING,ZERO,SCOPE} = require('./constans');


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
        GENERATESTRING("each_index")
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
    }
}