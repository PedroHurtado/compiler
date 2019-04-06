import {injector} from './injector.js'
import {Baz} from './baz.js';
export class Bar{
    constructor(baz){
        this.Baz = baz
    }
    static get inject(){
        return [Baz]
    }
}
injector.register(Bar);