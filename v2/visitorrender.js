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
const exportCode = function (ast) {
  let newCode = generate(ast).code;
  return newCode;
}
const visitorrender = function (code) {
  const ast = parser(code);
  traverse(ast, {
    FunctionDeclaration(path) {
      let { node } = path;
      let { name } = node.id;
      if (name === 'render') {
        let scope = {
          variables: [],
          blockIndex :0,
          nodeIndex :0,
          blocks :[],
          currentBlock : 0
        }
        path.traverse(visitor, scope)
        path.stop();
        if (scope.variables.length) {
          let { body } = node.body
          let declarator = t.variableDeclaration("var", scope.variables);
          body.unshift(declarator);
        }

      }
    }
  });
  return exportCode(ast);
}
module.exports = visitorrender;
