import {create,append} from './domfunctions.js';
import {getConstructor} from './customelements.js';
export function bootStrap(parent,data={}){
    let {tag} = this;
    let ctor = getConstructor(tag);
    let node =create(tag,0);
    if(!ctor.customElement){
        let instance = new ctor();
        instance.__node = node;
        if('set' in instance){
            instance.set(data);
        }
    }
    else{
        if('set' in node){
            node.set(data);
        }
    }
    append(parent,node,parent.firstChild);
}