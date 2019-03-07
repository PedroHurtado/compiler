const t = require('@babel/types');

module.exports = function createifblocks(blocks) {
    return blocks.map(block => {
        block.normalizeBlock();
        let blockStatement = t.blockStatement([block.blockIf]);
        let functionDeclararion = t.functionDeclaration(block.identifier, [t.identifier('$')], blockStatement);
        return functionDeclararion;
    });
}