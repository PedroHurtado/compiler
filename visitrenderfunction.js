const parser = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const prettier = require('prettier');
const { transform } = require('@babel/core');
const visit = require('./visitor');
const createblocks = require('./createblocks');


const globalIdentifier = (path) => {
  return function (name) {
    return path.scope.generateUidIdentifier(name);
  }
};
const exportCode = function(ast){
  let newCode = generate(ast).code;
  return newCode;
}
const visitor = function(code,domNodes){
  const ast = parser(code);
  traverse(ast, {
    FunctionDeclaration(path) {
      let node = path.node;
      let name = node.id.name;
  
      if (name === 'render') {
        let blocks = visit(path, domNodes,globalIdentifier(path));
        path.stop();
        let functions = createblocks(blocks);
        let lastFunction = functions[functions.length - 1];
        let returStatement = t.returnStatement(
          lastFunction.id
        );
        let statements = t.blockStatement([...functions,returStatement]);
        path.replaceWith(
          t.functionDeclaration(node.id,[],statements)
        );
      }
    }
  });
  return exportCode(ast);
}
module.exports = visitor;
