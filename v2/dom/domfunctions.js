export function create(tag){
    return document.createElement(tag);
}
export function append(parent, node,anchor) {
    parent.insertBefore(node,anchor);
}
export function createText(text){
  return  document.createTextNode(text);
}
export function updateText(node,text){
    node.data  = text;
}
export function setAttribute(node,attr,value) {
    if(name==='class'){
        appendClass(value);
    }else{
        node.setAttribute(attr, value)
    }
}
export function style(node,property,value){
    node.style.setProperty(property,value);
}
export function remove(node){
    node.parentNode.removeChild(node);
}
export function appendClass(node, className) {
   node.className = className.trim();
}
export function createEvent(node, event, handler) {
    node.addEventListener(event, handler)
}
export function removeEvent(node,event,handler){
    node.removeEventListener(event,handler);
}
