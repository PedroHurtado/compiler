const {
    RENDER,
    APPEND,
    APPENDATTRIBUTE,
    ANCHOR,
    APPENDEVENT,
    APPENDTEXT,
    FOREACH,
    VDOM,
    VDOMINSTANCE
  } = require("./reservedwords");
  
  const globalScope = [
    RENDER,
    APPEND,
    APPENDATTRIBUTE,
    ANCHOR,
    APPENDEVENT,
    APPENDTEXT,
    FOREACH,
    VDOM,
    VDOMINSTANCE,
    ...Object.getOwnPropertyNames(Array),
    ...Object.getOwnPropertyNames(Array.prototype),
    ...Object.getOwnPropertyNames(Object.prototype),
    ...Object.getOwnPropertyNames(Object)
  ];
  
  module.exports = globalScope;