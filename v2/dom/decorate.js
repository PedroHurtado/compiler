import {set} from './changes.js';
const noop = function(){};
function decorateOutputs(ctor) {
    let outputs = ctor.outputs;
    if (Array.isArray(outputs)) {
        let attribute = 
        outputs.forEach(output => {
            let attribute = `_${output}`
            Object.defineProperty(ctor.prototype, output, {
                get: function () {
                    return this[attribute] || noop;
                },
                set: function (value) {
                    this[attribute] = value;
                }
            })
        })
    }
}
function decorateInputs(ctor){
    let inputs = ctor.inputs;
    if(inputs && typeof inputs === 'object'){
        Object.keys(inputs).forEach(input=>{
            let attribute = `_${input}`
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