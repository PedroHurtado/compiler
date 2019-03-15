function create(tag){
    return document.createElement(tag);
}
function append(parent, node,anchor) {
    parent.insertBefore(node,anchor);
}
function createText(text){
  return  document.createTextNode(text);
}
function updateText(node,text){
    node.data  = text;
}
function setAttribute(node,attr,value) {
    if(name==='class'){
        appendClass(value);
    }else{
        node.setAttribute(attr, value)
    }
}
function remove(node){
    node.parentNode.removeChild(node);
}
function appendClass(node, className) {
   node.className = className.trim();
}
function createEvent(node, event, handler) {
    node.addEventListener(event, handler)
}
function removeEvent(node,event,handler){
    node.removeEventListener(event,handler);
}
module.exports = {
    CREATE: create,
    APPEND: append,
    CREATETEXT: createText,
    UPDATETEXT:updateText,
    ATTRIBUTE: setAttribute,
    CLASS:appendClass,
    CREATEEVENT: createEvent,
    REMOVEEVENT:removeEvent,
    COMMENT:createComment,
    REMOVE:remove,
}