import {set} from './changes.js';

function decorateOutputs(ctor) {
    let outputs = ctor.outputs;
    if (Array.isArray(outputs)) {
        outputs.forEach(output => {
            Object.defineProperty(ctor.prototype, output, {
                get: function () {
                    return this[`_${output}`] || function(){};
                },
                set: function (value) {
                    this[`_${output}`] = value;
                }
            })
        })
    }
}
function decorateInputs(ctor){
    let inputs = ctor.inputs;
    if(inputs && typeof inputs === 'object'){
        Object.keys(inputs).forEach(input=>{
            Object.defineProperty(ctor.prototype,input,{
                get:function(){
                    return this[`_${input}`];
                },
                set:function(value){
                    this[`_${input}`] = value;
                }
            })
        })
    }
}
export function decorate(ctor, render) {
    ctor.prototype.set = set(render);
    decorateOutputs(ctor);
    decorateInputs(ctor);
}