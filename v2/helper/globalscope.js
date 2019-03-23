const {
    RENDER,
    APPEND,
    APPPENDCOMPONENT,
    APPENDATTRIBUTE,
    ANCHOR,
    APPENDEVENT,
    APPENDTEXT,
    FOREACH,
    VDOM,
    VDOMINSTANCE,
    PROPERTIES,
    OUTPUT
  } = require("./reservedwords");
  
  const globalScope = [
    RENDER,
    APPEND,
    APPPENDCOMPONENT,
    APPENDATTRIBUTE,
    ANCHOR,
    APPENDEVENT,
    APPENDTEXT,
    FOREACH,
    VDOM,
    VDOMINSTANCE,
    PROPERTIES,
    OUTPUT,
    ...Object.getOwnPropertyNames(Array),
    ...Object.getOwnPropertyNames(Array.prototype),
    ...Object.getOwnPropertyNames(Object.prototype),
    ...Object.getOwnPropertyNames(Object)
  ];
  
  module.exports = globalScope;