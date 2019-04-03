import {changes} from './changes.js';

const getProperty =(value)=>`_${value}`

function set(data){
    changes(data,this)
}
function decorateProps(ctor){
    let props = ctor.props;
    if(props && typeof props === 'object'){
        Object.keys(props).forEach(prop=>{
            let property = getProperty(prop);
            Object.defineProperty(ctor.prototype,prop,{
                get:function(){
                    return this[property];
                },
                set:function(value){
                    this[property] = value;
                }
            });
            ctor.prototype[property] = props[prop];
        })
    }
}
export function decorateDirective(ctor){
   ctor.prototype.set = set;
   decorateProps(ctor);
}