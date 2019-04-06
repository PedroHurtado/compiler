import {injector} from './injector.js'
export class Baz{
    constructor(){
        console.log("Hello");
    }
}
injector.register(Baz);
