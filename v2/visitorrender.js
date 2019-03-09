const parser = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const visitor = require('./visitor');



const globalIdentifier = (path) => {
  return function (name) {
    return path.scope.generateUidIdentifier(name);
  }
};
const exportCode = function(ast){
  let newCode = generate(ast).code;
  return newCode;
}
const visitorrender = function(code){
  const ast = parser(code);
  traverse(ast, {
    FunctionDeclaration(path) {
      let node = path.node;
      let name = node.id.name;
      
      if (name === 'render') {
        path.traverse(visitor,{})
        path.stop();
      }
    }
  });
  return exportCode(ast);
}
module.exports = visitorrender;
