const reservedWords = [
    'render',
    'append',
    'appendText',
    'appendAttribute',
    'appendEvent',
    'anchor'
    'target',
    'vdom'
];
const globalScope = [...reservedWords,
...Object.getOwnPropertyNames(Array),
...Object.getOwnPropertyNames(Array.prototype),
...Object.getOwnPropertyNames(Object.prototype),
...Object.getOwnPropertyNames(Object),
];

module.exports = globalScope;