const template = require('@babel/template');
const t = require('@babel/types');
function appendEvent(path, args, keys) {
    let [event, expression] = args;
    let handler = path.parentPath.scope.generateUidIdentifier('handler');
    let properties = [...keys].map(key=>{
        let identifier = t.identifier(key);
        return t.objectProperty(identifier, identifier,false,true);
    })
    
    let contextTemplate = `
            function HANDLER(event){
                let OBJECTPATTERN = event.currentTarget.__events[EVENT].scope;
                EXPRESSION;
        }
    `;
    // ASSIGN: assignContext,
    let mapObject = {
        HANDLER: handler,
        EXPRESSION: expression,
        OBJECTPATTERN:t.objectPattern(properties),
        EVENT:event
    }

    let _template = template.statements(contextTemplate)
    let statements = _template(mapObject);


    return {
        _arguments: [event,handler,t.objectExpression(properties)],
        statements: [...statements]
    }

}

module.exports = appendEvent