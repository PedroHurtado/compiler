export default function App(target,data){
    Object.assign(this,data);
    this.fragment = render()(this);
    this.fragment.c();
    this.fragment.m(target,null);
 }
 App.prototype.set = function(data){
   this.fragment.u({},data)
 }