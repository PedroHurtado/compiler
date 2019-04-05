const types = {
    INSTANCE: 0,
    VALUE: 1,
    SINGLETON: 2
};
class Injector {
    constructor() {
        this._dependencies = new Map();
        this._cache = new Map();
    }
    register(ctor) {
        _register(this, ctor, ctor.inject, types.INSTANCE);
    }
    registerValue(key, value) {
        _register(this, key, value, types.VALUE);
    }
    registerSingleton(ctor) {
        _register(this, ctor, ctor.inject, types.SINGLETON);
    }
    _getArguments(args){
        return (args||[]).map(arg=>{
            return this.get(arg);
        });
    }
    _getType(ctor){
        let type=this._dependencies.get(ctor);
        if(!type){
            throw `the type ${ctor.name || ctor} is not registered`
        }
        return type;
    }
    get(_type) {
        let { ctor, args, type } = this._getType(_type);
        if (ctor) {
            if (type === types.SINGLETON) {
                let instance = this._cache.get(ctor);
                if(!instance){
                    instance = new ctor(...this._getArguments(args));
                    this._cache.set(ctor,instance);
                }
                return instance;
            } else {
                return new ctor(...this._getArguments(args));
            }
        } else {
            return args;
        }
    }
}
function _register(injector, ctor, dependencies, type) {
    if (type !== type.VALUE) {
        injector._dependencies.set(ctor, {
            type,
            ctor,
            args: dependencies
        });
    } else {
        injector._dependencies.set(ctor, {
            type,
            ctor: null,
            args: dependencies
        });
    }
}
export const injector = new Injector();
