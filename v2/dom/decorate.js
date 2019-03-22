function changes(data, instance) {
    if(!data) return;
    let changes = false;
    for (let key in data) {
        let change =
            instance[key] !== data[key] ||
            typeof data[key] === "object" ||
            typeof data[key] === "function";
        if (change) {
            changes = change;
            instance[key] = data[key];
        }
    }
    return changes;
}

function set(render) {
    return function (data) {
        if (this.first === undefined) {
            this.first = 1;
            changes(data, this)
            render(this);
        } else {
            this.first = 0;
            if (changes(data, this){
                render(this);
            }
        }
    }
}
export function decorate(ctor, render) {
    ctor.prototype.set = set(render);
}