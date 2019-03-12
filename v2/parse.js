const parser = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitorRender= require('./visitorrender');

const generateCode = function (ast) {
  let newCode = generate(ast).code;
  return newCode;
}
const parseCode = function(code){
  let ast = parser(code)
  traverse(ast, visitorRender);
  return generateCode(ast);
}
module.exports = parseCode;
