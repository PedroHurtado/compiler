import {defineDirective} from './dom/index.js'
class Directive{
    constructor(node,component){
        this.node = node;
        this.component = component;
    }
    disconnectedCallback(){

    }
    connectedCallback(){

    }
    static get props(){
        return {a:true};
    }
    static get tag(){
        return 'directive';
    }
}
defineDirective(Directive);
