export {VDom} from './vdom.js';
export {define,defineDirective} from './customelements.js';
export {decorate} from './decorate.js';
export  * from './shadowmode.js';
export function getEventScope(event,eventName){
    return event.currentTarget.__events[eventName].scope;
}