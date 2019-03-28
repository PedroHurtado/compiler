export function changes(data, instance) {
    if (!data) return;
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