function create(tag){
    return document.createElement(tag);
}
function append(parent, node,anchor) {
    parent.insertBefore(node,anchor);
}
function createText(text){
  return  document.createTextNode(value);
}
function updateText(node,text){
    node.data  = value;
}
function appendAttribute(node,namevalues) {
    if(name==='class'){
        appendClass(node,value);
    }else{
        node.setAttribute(name, value)
    }
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
module.exports = {
    CREATE: create,
    APPEND: append,
    CREATETEXT: createText,
    UPDATETEXT:updateText,
    ATTRIBUTE: appendAttribute,
    CLASS:appendClass,
    CREATEEVENT: createEvent,
    REMOVEEVENT:removeEvent,
    COMMENT:createComment,
    REMOVE:remove,
}