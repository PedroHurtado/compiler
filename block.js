const t = require('@babel/types');
module.exports = class Block {
    constructor(identifier) {
        this.identifier = identifier;
        this.create = [];
        this.update = [];
        this.remove = {
            nodes:[],
            events:[]
        }
        this._mount = {
            principal:[],
            secondary:[]
        };
        this.variables = [];
        this.variablesIf = [];
        this.ifBlocks=[];
        this.variablesEach = [];
        this.handlers = [];
        this.scope;
        this._parent;
        this._updateArguments= [t.identifier('changed'), t.identifier('$')];
        this._anchor = t.identifier('anchor');
        this._defaultParent = t.identifier('target');
        this._detach = t.identifier('detach');
        this._defaultDetach = t.booleanLiteral(true);
        this._hasChildren=false;
        this.scope;
        this.commands=[];

    }
    get removeStatements(){
        if(this.remove.nodes.length){
            let _if = t.ifStatement(this._detach,t.blockStatement(this.remove.nodes));
            return [...this.remove.events,_if];
        }
        return this.remove.events;
    }
    get mountStatements(){
        return [...this._mount.secondary,...this._mount.principal]
    }
    get mountArguments() {
        return [this.parent,this._anchor];
    }
    get updateArguments() {
        return this._updateArguments;
    }
    get removeParams(){
        return [this._detach]
    }
    get parent(){
        return  this._parent
    }
    set parent(value){
        if(!this._parent && value){
            this._parent = t.identifier(value);   
        }
    }
    mount(key,statement){
        if(key===this.parentName){
            this._mount.principal.push(statement);
        }
        else {
            this._mount.secondary.push(statement);
        }
    }
    get parentName(){
        return this._parent.name;
    }
    set hasChildren(value){
        if(!this._hasChildren && value){
            this._hasChildren = true;
        }
        
    }
    get hasChildren(){
        return this._hasChildren;
    }
    generate(){
        this.commands.forEach(command=>{
            command();
        });

    }
    
    
   
}