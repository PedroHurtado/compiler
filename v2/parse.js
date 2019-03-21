const parser = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitorRender = require('./visitorrender');
const { initNodes } = require('./helper/transform');

const generateCode = function (ast) {
  let newCode = generate(ast).code;
  return newCode;
}
const parseCode = function (code) {
  initNodes();
  let ast = parser(code,{
    sourceType:'module'
  });
  traverse(ast, visitorRender);
  return generateCode(ast);
}
module.exports = parseCode;
