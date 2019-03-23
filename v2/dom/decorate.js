function changes(data, instance) {
    if (!data) return;
    let changes = false;
    for (let key in data) {
        let change =
            instance[key] !== data[key] ||
            typeof data[key] === "object" ||
            typeof data[key] === "function";
        if (change) {
            changes = change;
            instance[key] = data[key];
        }
    }
    return changes;
}

function set(render) {
    return function (data) {
        if (this.first === undefined) {
            this.first = 1;
            changes(data, this)
            render(this);
        } else {
            this.first = 0;
            if (changes(data, this)){
                render(this);
            }
        }
    }
}
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
function decorateDefaultValues(ctor){
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
    decorateDefaultValues(ctor);
}