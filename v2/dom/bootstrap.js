import { create, append } from './domfunctions.js';
import { getConstructor } from './customelements.js';
export function bootStrap(parent,data = {},anchor=null) {
    let { tag } = this;
    let { customElement } = getConstructor(tag);
    let instance = new this();
    if (!customElement) {
        instance.__node = create(tag, 0);
    }
    instance.set(data);
    append(parent, instance.__node || instance, anchor || parent.firstChild);
}