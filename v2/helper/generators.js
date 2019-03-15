const t = require('@babel/types');
const {createMeta}=require('./meta');
const {GENERATESTRING,ZERO,SCOPE} = require('./constans');
const EACH_INDEX = 'each'
const SUBKEY = 'subKey';
function generateEach(path) {
    return path.scope.generateUidIdentifier(
        EACH_INDEX
    );
}
function generateVariable(variable) {
    return t.variableDeclarator(variable, ZERO);
}
function generateSubKey(path){
    return path.scope.generateUidIdentifier(SUBKEY);
}
function generateMemberScope(node){
    return t.memberExpression(SCOPE, node);
}
function generateUpdateVar(variable){
   return t.updateExpression("++", variable);
}
function generateGlobalVar(variables){
    return t.variableDeclaration("var", variables);
}
function generateArrayExpression(items){
    return t.arrayExpression(items)
}
module.exports={
    visitor:{
        generateEach,
        generateVariable,
        generateMemberScope,
        generateUpdateVar,
        generateGlobalVar,
        generateSubKey,
    },
    generateArrayExpression
}