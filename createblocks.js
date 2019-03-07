const t = require('@babel/types');
const createIfblocks = require('./createIfblocks')
module.exports = function createblocks(blocks) {

    let parent;
    for (let i = 0; i < blocks.length - 1; i++) {
        if (blocks[i].hasChildren) {
            parent = blocks[i].parentName;
        }
        else {
            blocks[i].parent = parent;
        }
    }
    blocks[blocks.length - 1].parent = 'target';

    let processedBlocks = blocks.map(block => {
        block.generate();
        let returnStatement = createObject(block);
        let globalVariables = getGlobalVarriables(block)
        let ifBlocks = createIfblocks(block.ifBlocks);
        let blockStatement = t.blockStatement(
            [
                globalVariables,
                ...ifBlocks,
                ...block.variablesIf,
                ...block.variablesEach,
                ...block.handlers,
                returnStatement,
            ]
        );


        let functionDeclararion = t.functionDeclaration(
            block.identifier,
            [
                t.identifier('$'),
            ],
            blockStatement,
        );
        return functionDeclararion;
    });
    return processedBlocks;
}
function getGlobalVarriables(block) {
    return t.variableDeclaration(
        "var",
        block.variables.map(variable => t.variableDeclarator(variable)),
    );
}
function createObject(block) {
    let properties = [
        createProperty(block.create, 'c'), //create
        createProperty(block.mountStatements, 'm', block.mountArguments), //mount
        createProperty(block.update, 'u', block.updateArguments), //update
        createProperty(block.removeStatements, 'd', block.removeParams), //remove
    ];
    let obj = t.objectExpression(
        properties
    );
    return t.returnStatement(obj)
}
function createProperty(statements, identifier, args) {
    if (!statements.length) {
        return t.objectProperty(
            t.identifier(identifier),
            t.identifier('noop')
        )
    }
    else {
        let blockStatements = t.blockStatement(statements);
        return t.objectProperty(
            t.identifier(identifier),
            t.functionExpression(
                null,
                args || [],
                blockStatements
            )
        );
    }

}
