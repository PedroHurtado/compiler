const {
    RENDER,
    APPEND,
    APPENDATTRIBUTE,
    ANCHOR,
    APPENDEVENT,
    APPENDTEXT,
    FOREACH,
    VDOM
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
    ...Object.getOwnPropertyNames(Array),
    ...Object.getOwnPropertyNames(Array.prototype),
    ...Object.getOwnPropertyNames(Object.prototype),
    ...Object.getOwnPropertyNames(Object)
  ];
  
  module.exports = globalScope;