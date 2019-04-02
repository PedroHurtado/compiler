import {defineDirective} from './dom/customelements.js'
class Directive{
    set(obj){
        
    }
    static get tag(){
        return 'directive';
    }
}
defineDirective(Directive);
