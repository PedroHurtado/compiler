const parser = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const visitor = require('./visitor');
const Block = require('./helper/block')
const Anchor = require('./helper/anchor');
const globalScope = require('./helper/globalscope');
const { generateGlobalVar } = require('./helper/generators').visitor
const visitorRender= require('./visitorrender');



const generateCode = function (ast) {
  let newCode = generate(ast).code;
  return newCode;
}
const parseCode(code){
  traverse(ast, visitorRender);
  return generateCode(ast);
}
module.exports = parseCode;
