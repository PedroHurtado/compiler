const t = require('@babel/types');
const template = require('@babel/template');


function hasExpression(args) {
    let exp = args.slice(1).filter(c => {
        return c.type.indexOf('Literal') === -1
    })
    return exp.length > 0;
}
function append(ctx, path, declarator) {
    let node = path.node;
    let args = node.arguments;
    let isPrincipalChild = (ctx.parent.name === args[0].name);
    let anchor = isPrincipalChild ? t.identifier('anchor') : t.nullLiteral();


    let create = t.assignmentExpression(
        "=",
        declarator,
        t.callExpression(
            t.identifier('create'), args.slice(1)
        ),
    );

    let mount = t.callExpression(
        t.identifier('append'),
        [args[0], declarator, anchor]
    );

    ctx.create.push(t.expressionStatement(create));
    ctx.mount(args[0].name,t.expressionStatement(mount))
    
    ctx.variables.push(declarator);

    //delete 
    if (isPrincipalChild) {
        let remove = t.callExpression(
            t.identifier('remove'),
            [declarator]
        );
        ctx.remove.nodes.push(t.expressionStatement(remove));
    }
}
function appendText(ctx, path, declarator) {
    let node = path.node;
    let args = node.arguments;
    let isPrincipalChild = (ctx.parent.name === args[0].name);
    let anchor = isPrincipalChild ? t.identifier('anchor') : t.nullLiteral();
    let expression = hasExpression(args);
    let flag = expression?t.numericLiteral(1):t.numericLiteral(0);
    let create = t.assignmentExpression(
        "=",
        declarator,
        t.callExpression(
            t.identifier('createText'),
            [flag,...args.slice(1)]
        )
    );
    ctx.create.push(t.expressionStatement(create));
    let mount = t.callExpression(
        t.identifier('append'),
        [args[0], declarator, anchor]
    );

    ctx.mount(args[0].name,t.expressionStatement(mount))
   
    ctx.variables.push(declarator);
    if (expression) {
        let updateText = t.callExpression(
            t.identifier('updateText'),
            [declarator, flag,...args.slice(1)]
        )
        ctx.update.push(t.expressionStatement(updateText));
    }

    //delete 
    if (isPrincipalChild) {
        let removeText = t.callExpression(
            t.identifier('remove'),
            [declarator]
        );
        ctx.remove.nodes.push(t.expressionStatement(removeText));
    }
}
function appendAttribute(ctx, path) {
    let node = path.node
    let args = node.arguments;
    node.arguments = [...args.slice(0,2),t.numericLiteral(0),...args.slice(2)];
    
    ctx.create.push(t.expressionStatement(node));
    if (hasExpression(args)) {
        node.arguments[2]=t.numericLiteral(1);
        let update = t.expressionStatement(t.callExpression(
            t.identifier('updateAttribute'),
            node.arguments
        ))
        ctx.update.push(update);
    }
}
function appendEvent(ctx, path) {
    let node = path.node; 
    let args = node.arguments;
    let handler = path.parentPath.scope.generateUidIdentifier('handler');
    let expression = args[args.length-1];
    let argsCall = [...args.slice(0,2),handler]
    let contextTemplate = `
        function HANDLER(event){
            EXPRESSION
        }
    `;
    let mapObject = {
        HANDLER:handler,
        EXPRESSION:expression,
    }
    let _template = template.statements(contextTemplate)
    let statements = _template(mapObject);
    ctx.handlers.push(...statements);
    let createEvent = t.expressionStatement(
        t.callExpression(
            t.identifier('createEvent'),
            argsCall
        )
    );
    ctx.create.push(createEvent);
    let removeEvent = t.expressionStatement(
        t.callExpression(
            t.identifier('removeEvent'),
            argsCall
        )
    );
    
    ctx.remove.events.push(removeEvent);


}
function others(ctx, path) {
    ctx.create.push(path.node);
    ctx.update.push(path.node);
}

function helperIF(path, _if, current) {
   
    let resolveIf = path.parentPath.scope.generateUidIdentifier('currentIf');
    let anchor = path.parentPath.scope.generateUidIdentifier('ifBlock_anchor');
    let ifBlock = path.parentPath.scope.generateUidIdentifier('ifBlock');
    let ctx = t.identifier('$');
    current.variablesIf.push(t.variableDeclaration('var', [
        t.variableDeclarator(resolveIf, t.callExpression(_if.identifier, [ctx]))
    ]));
    current.variablesIf.push(t.variableDeclaration('var', [
        t.variableDeclarator(ifBlock, t.callExpression(resolveIf, [ctx]))
    ]));
    current.variables.push(anchor);

    current.create.push(
        t.expressionStatement(
            t.callExpression(
                t.memberExpression(ifBlock, t.identifier('c')),
                []
            )
        )
    );
    current.create.push(
        t.expressionStatement(
            t.assignmentExpression("=",
                anchor,
                t.callExpression(t.identifier('createComment'), [])
            )
        )
    );

    let mountIf = t.expressionStatement(
        t.callExpression(
            t.memberExpression(ifBlock, t.identifier('m')),
            [_if.blockParent.parent, current._anchor]
        )
    );
    let mountAnchor =  t.expressionStatement(
        t.callExpression(
            t.identifier('append'),
            [_if.blockParent.parent, anchor, current._anchor]
        )
    )
    current.mount(_if.parentName,mountIf)
    current.mount(_if.parentName,mountAnchor)


    //update

    let contextTemplate = `if (CURRENTBLOCK !== (CURRENTBLOCK = GETBLOCK($))) {
        IFBLOCK.d(1);
        IFBLOCK = CURRENTBLOCK($);
        IFBLOCK.c();
        IFBLOCK.m(ANCHOR.parentNode, ANCHOR);
    } else{
        IFBLOCK.u(changed,$)
    }`
    let mapObject = {
        CURRENTBLOCK: resolveIf,
        IFBLOCK: ifBlock,
        ANCHOR: anchor,
        GETBLOCK: _if.identifier,
        $: t.identifier('$'),
    }
    let _template = template.statements(contextTemplate)
    let statements = _template(mapObject);
    current.update.push(statements[0]);

    //delete


    current.remove.events.push(
        t.expressionStatement(
            t.callExpression(
                t.memberExpression(ifBlock, t.identifier('d')),
                [current._detach]
            )
        )
    );

    current.remove.nodes.push(
        t.expressionStatement(
            t.callExpression(
                t.identifier('remove'),
                [anchor]
            )
        )
    );



}

function helperEach(current, path) {



    let node = path.node;
    //arrowFunctions or functions
    let fn = path.node.arguments[0];
    let args = fn.params || fn.arguments;

    function createNodes(ctx, current, path) {
        let blockIdentifier = ctx.identifier, parent = ctx.parent;
        let each = path.parentPath.scope.generateUidIdentifier('each');
        let contextEach = path.parentPath.scope.generateUidIdentifier('each_context');
        let eachBlocks = path.parentPath.scope.generateUidIdentifier('each_block')
        let anchor = path.parentPath.scope.generateUidIdentifier('each_anchor');
        let parentIdentifier = parent;

        current.variables.push(anchor);
        let variable = t.variableDeclaration("var",
            [
                t.variableDeclarator(
                    each,
                    node.callee.object
                )
            ]
        );
        current.variablesEach.push(variable);



        let contextTemplate = `
        var CONTEXTEACH = function($,ITEM){
            let ctx = Object.create($);
            ctx.ITEM = ITEM;
            return ctx;
        };
        var EACHBLOCKS = EACH.map(ctx=>BLOCKIDENTIFIER(CONTEXTEACH($,ctx)));
        `
        let mapObject = {
            CONTEXTEACH: contextEach,
            ITEM: args[0],
            $: t.identifier('$'),
            EACH: each,
            BLOCKIDENTIFIER: blockIdentifier,
            EACHBLOCKS:eachBlocks
        }

        //index is present
        if (args.length > 1) {
            contextTemplate = `
            var CONTEXTEACH = EACH.forEach((ITEM,INDEX) => {
                let ctx = Object.create($);
                ctx.ITEM = ITEM;
                ctx.INDEX = INDEX;
                return BLOCKIDENTIFIER(ctx);
            }).map(c => c);`
            mapObject.INDEX = args[1];
        }

        let _template = template.statements(contextTemplate)
        let statements = _template(mapObject);
        
        current.variablesEach.push(...statements);
       

        let create = createEach({ EACH: eachBlocks });
        current.create.push(...create);
        current.create.push(
            t.expressionStatement(
                t.assignmentExpression("=",
                    anchor,
                    t.callExpression(t.identifier('createComment'), [])
                )
            )
        );

        let mount = mountEach({ EACH: eachBlocks, PARENT: parentIdentifier });
        let anchorMount = t.expressionStatement(
            t.callExpression(
                t.identifier('append'),
                [parentIdentifier, anchor, current._anchor]
            )
        );

        current.mount(parentIdentifier.name,...mount);
        current.mount(parentIdentifier.name,anchorMount);

       
        //update

        let contextTemplateUpdate=`
        EACH.forEach((item,i)=>{
            const ctx = CONTEXTEACH($,item,i);
            if(EACHBLOCKS[i]){
                EACHBLOCKS[i].u(changed,ctx);
            }
            else{
                EACHBLOCKS[i]=_block_context4(ctx);
                EACHBLOCKS[i].c();
                EACHBLOCKS[i].m(ANCHOR.parentNode,ANCHOR);
            }
        });
        EACHBLOCKS.slice(EACH.length).forEach(item=>{
              item.d(1);
        });
        EACHBLOCKS.length = EACH.length;
        `;
        let mapUpdate={
            EACH:node.callee.object,
            CONTEXTEACH:contextEach,
            EACHBLOCKS:eachBlocks,
            $:t.identifier('$'),
            ANCHOR:anchor
        }
        let templateUpdate = template.statements(contextTemplateUpdate);
        let update = templateUpdate(mapUpdate);        
        current.update.push(...update);
    
        let remove = deleteEach({EACH:eachBlocks});
        current.remove.events.push(...remove);
        current.remove.nodes.push(
            t.expressionStatement(
                t.callExpression(t.identifier('remove'),
                [anchor]
                )
            )
        );
    }
    return Object.assign(createNodes,
        {
            scope: new Set(args.map(arg => arg.name)),
            parentBlock: current,
        }
    );



}
function createEach(mapObject) {
    let contextTemplate = `
        EACH.forEach((each) => {
            each.c();
        })
    `;
    let _template = template.statements(contextTemplate)
    return _template(mapObject);
}
function mountEach(mapObject) {
    let contextTemplate = `
        EACH.forEach((each) => {
            each.m(PARENT,anchor);
        })
    `;
    let _template = template.statements(contextTemplate)
    return _template(mapObject);
}
function deleteEach(mapObject){
    let contextTemplate = `
    EACH.forEach((each) => {
        each.d(detach);
    })
`;
let _template = template.statements(contextTemplate)
return _template(mapObject);
}

module.exports.append = append;
module.exports.appendText = appendText;
module.exports.appendAttribute = appendAttribute;
module.exports.appendEvent = appendEvent;
module.exports.others = others;
module.exports.helperIF = helperIF;
module.exports.helperEach = helperEach;