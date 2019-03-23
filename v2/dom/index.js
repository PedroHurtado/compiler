export {VDom} from './vdom.js';
export {define} from './customelements.js';
export {decorate} from './decorate.js'
export function getEventScope(event,eventName){
    return event.currentTarget.__events[eventName].scope;
}
