import {injector} from './injector.js';
import {Bar} from './bar.js';

export class Foo{
    constructor(bar){
        this.Bar = bar;
    }
    static get inject(){
        return [Bar];
    }
}
injector.registerSingleton(Foo);

let instance = injector.get(Foo);
let instance1 = injector.get(Foo);
console.log(instance === instance1);