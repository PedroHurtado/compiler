const template = require('@babel/template');
const t = require('@babel/types');
const {SCOPE} = require('./constans');
function output(path, args) {
    let [outputName,fn,scope] = args;
    let handler = path.parentPath.scope.generateUidIdentifier('handler');

    let templateContent =`
        function HANDLER(...args){
            let {$} = HANDLER.scope;
            FN(...args)
        }
    `;

    let mapObject = {
        HANDLER:handler,
        $:SCOPE,
        FN:fn,
    };

    let _template = template.statements(templateContent)
    let statements = _template(mapObject);

    return{
        statements:[...statements],
        _arguments:[outputName,handler,scope],
    }

}

module.exports=output;