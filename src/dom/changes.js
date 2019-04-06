function onChanges(instance,property,newValue,oldVale){
    if('onChanges' in instance ){
        instance.onChanges(property,newValue,oldVale);
    }
}
export function changes(data, instance) {
    if (!data) return;
    let dirty = false;
    for (let key in data) {
        let change =
            instance[key] !== data[key] ||
            typeof data[key] === "object" ||
            typeof data[key] === "function";
        if (change) {
            dirty=true;
            let newValue = data[key];
            let oldVale = instance[key];
            onChanges(instance,key,newValue,oldVale);
            instance[key] = data[key];
        }
    }
    return dirty;
}

export function set(render) {
    return function (data) {
        if (this.first) {
            changes(data, this)
            render(this);
            this.first =0;
        } else {
            this.first = 0;
            if (changes(data, this)){
                render(this);
            }
        }
    }
}