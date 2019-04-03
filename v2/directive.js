import {defineDirective} from './dom/customelements.js'
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
