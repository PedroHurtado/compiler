
const MAXLENGTH = Math.pow(2, 15);  //max 32kb in template
class Writer{
    constructor(){
        this.position = 0;
        this.buffer = Buffer.alloc(MAXLENGTH);
    }
    write(code){
        if(code){
            this.position+=this.buffer.write(code,this.position);
        }
    }
    get code(){
        let code = this.buffer.toString("utf-8",0,this.position);
        this.dispose();
        return code;
    }
    dispose(){
        this.position =0;
        this.buffer =null;
    }
}

module.exports = Writer;