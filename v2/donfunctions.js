function create(tag){
    return document.createElement(tag);
}
function append(parent, node,anchor) {
    parent.insertBefore(node,anchor);
}
function createText(flag,...text){
    let value = text.join('')
    let node = document.createTextNode(value);
    flag && setState(node,'data',value)
    return node;
}
function updateText(node,flag,...text){
    let value = text.join('');
    let changed = flag && setState(node,'data',value) 
    if(changed){
        node.data = value;
    }
}
function appendAttribute(node,name,flag, ...values) {
    let value = values.join('').trim();
    flag && setState(node,name,value);
    if(name==='class'){
        appendClass(node,value);
    }else{
        node.setAttribute(name, value)
    }
}
function updateAttribute(node,name,flag, ...values) {
    let value = values.join('').trim();
    let changed = flag && setState(node,name,value);
    if(changed){
        if(name==='class'){
            appendClass(node,value);
        }else{
            node.setAttribute(name, value)
        }
    }
    
}
function setState(node,prop,value){
    let state = (node.__state = node.__state || {});
    let hasProp = prop in state;
    if(!hasProp){
        state[prop]= value;
        return true;
    }
    else{
        let changed = (state[prop]!==value);
        if(changed){
            state[prop] = value;
            return true;
        }
    }
    return false;
}
function remove(node){
    node.parentNode.removeChild(node);
}
function appendClass(node, className) {
   node.className = className;
}
function createEvent(node, event, handler) {
    node.addEventListener(event, handler)
}
function removeEvent(node,event,handler){
    node.removeEventListener(event,handler);
}
function createComment(){
   return document.createComment('');
}
function noop(){};
function noopBlock(){
    return{
        c:noop,
        m:noop,
        u:noop,
        d:noop
    }
}
module.exports = {
    CREATE: create,
    APPEND: append,
    CREATETEXT: createText,
    UPDATETEXT:updateText,
    ATTRIBUTE: appendAttribute,
    UPDATEATTRIBUTE:updateAttribute,
    CLASS:appendClass,
    CREATEEVENT: createEvent,
    REMOVEEVENT:removeEvent,
    COMMENT:createComment,
    SETSTATE:setState,
    REMOVE:remove,
    NOOP: noop,
    NOOPBLOCK:noopBlock,
}