const parser = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitorRender = require('./visitorrender');


const generateCode = function (ast) {
  let newCode = generate(ast).code;
  return newCode;
}
const transformJs = function (code) {
  
  let ast = parser(code,{
    sourceType:'module',
    plugins:["dynamicImport"]
  });
  traverse(ast, visitorRender);
  return generateCode(ast);
}
module.exports = transformJs;
