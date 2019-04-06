const t = require('@babel/types');

const GENERATENUMERIC = (value) => t.numericLiteral(value);
const GENERATESTRING = (value) => t.stringLiteral(value);
const ONE = GENERATENUMERIC(1);
const ZERO = t.numericLiteral(0);
const NULL = t.nullLiteral();

const SEALED = ONE
const NOTSEALED = ZERO
const ISSEALDED = (sealed) => !!sealed ? NOTSEALED : SEALED;
const GENERATEIDENTIFIER = (identifier) => t.identifier(identifier);


const VDOM = t.identifier('vdom');
const SCOPE = t.identifier('$');



module.exports ={
    GENERATENUMERIC,
    GENERATESTRING,
    ZERO,
    NULL,
    ISSEALDED,
    GENERATEIDENTIFIER,
    VDOM,
    SCOPE
}