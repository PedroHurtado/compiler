const globalBindings = ['render', 'append', 'appendAttribute', 'appendEvent', 'appendText', 'target', 'vdom'];
const bindings = [...globalBindings,
...Object.getOwnPropertyNames(Array),
...Object.getOwnPropertyNames(Array.prototype),
...Object.getOwnPropertyNames(Object.prototype),
...Object.getOwnPropertyNames(Object),
];

module.exports = bindings;