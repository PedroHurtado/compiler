import {set} from './changes.js';
const noop = function(){};
const getAttribute =(value)=>`_${value}`
function decorateOutputs(ctor) {
    let outputs = ctor.outputs;
    if (Array.isArray(outputs)) {
        outputs.forEach(output => {
            let attribute =getAttribute(output);
            Object.defineProperty(ctor.prototype, output, {
                get: function () {
                    return this[attribute] || noop;
                },
                set: function (value) {
                    this[attribute] = value;
                }
            })
            ctor.prototype[attribute] = noop;
        })
    }
}
function decorateInputs(ctor){
    let inputs = ctor.inputs;
    if(inputs && typeof inputs === 'object'){
        Object.keys(inputs).forEach(input=>{
            let attribute = getAttribute(input);
            Object.defineProperty(ctor.prototype,input,{
                get:function(){
                    return this[attribute];
                },
                set:function(value){
                    this[attribute] = value;
                }
            });
            ctor.prototype[attribute] = inputs[input];
        })
    }
}
export function decorate(ctor, render) {
    ctor.prototype.set = set(render);
    decorateOutputs(ctor);
    decorateInputs(ctor);
}