import {set} from './changes.js';
import {bootstrap} from './bootstrap.js';
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
function decorateElementRef(ctor){
    Object.defineProperty(ctor.prototype,'elementRef',{
        get:function(){
            return this.__node || this;
        }
    });
}
function decorateRef(ctor){
    ctor.prototype.refs = {};
}
function connectedCallback(ctor){
    ctor.prototype.first = 1;
    let old = ctor.prototype.connectedCallback || noop;
    ctor.prototype.connectedCallback = function(){
        this.first && this.set();
        old();
    }
    
    
}
export function decorate(ctor, render) {
    ctor.prototype.set = set(render);
    decorateOutputs(ctor);
    decorateInputs(ctor);
    decorateElementRef(ctor);
    decorateRef(ctor);
    connectedCallback(ctor);
    ctor.bootstrap = bootstrap;
}