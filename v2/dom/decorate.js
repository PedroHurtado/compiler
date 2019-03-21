function changes(data, instance) {
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

function set(data) {
    if (this.first === undefined) {
        this.first = 1;
    } else {
        this.first = 0;
    }
    if(changes(data,this)){
       this.render(this);
    }
}
export function decorate(ctor,render) {
    ctor.prototype.set = set;
    ctor.prototype.render = render;
}