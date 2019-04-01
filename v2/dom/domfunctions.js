const NAMESPACES = {
    '0': 'http://www.w3.org/1999/xhtml',
    '1': 'http://www.w3.org/2000/svg'
}

export function create(tag, namespace) {
    if (namespace === 0) {
        return document.createElement(tag);
    }
    else {
        return document.createElementNS(
            NAMESPACES[namespace],
            tag
        );
    }
}
export function append(parent, node, anchor) {
    parent.insertBefore(node, anchor);
}
export function createText(text) {
    return document.createTextNode(text);
}
export function updateText(node, text) {
    node.data = text;
}
export function setAttribute(node, attr, value) {
    if (name === 'class') {
        appendClass(value);
    } else {
        node.setAttribute(attr, value)
    }
}
export function style(node, property, value) {
    node.style.setProperty(property, value);
}
export function remove(node) {
    node.parentNode.removeChild(node);
}
export function removeAdjacentHTML(node){
    while(node.previousSibling){
        let {__key} = node.previousSibling;
        if(__key){
            break;
        }
        remove(node.previousSibling);
    }
}
export function appendClass(node, className) {
    node.className = className.trim();
}
export function insertAdjacentHTML(node,html){
    let result = node.insertAdjacentHTML('beforebegin',html)
}
export function createEvent(node, event, handler) {
    node.addEventListener(event, handler)
}
export function removeEvent(node, event, handler) {
    node.removeEventListener(event, handler);
}
export function walker(root,instaceKey){
    return document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,function(node){
        let {__key,__instanceParentKey} = node;
        if(__key && __instanceParentKey===instaceKey){
            return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
    },false)
}
