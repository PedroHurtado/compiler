
const MAXLENGTH = (parseInt(Math.pow(2, 15)) + 10);
class Writer{
    constructor(){
        this.position = 0;
        this.buffer = Buffer.alloc(MAXLENGTH);
    }
    write(code){
        this.position+=this.buffer.write(code,this.position);
    }
    get code(){
        return this.buffer.toString("utf-8",0,this.position)
    }
}

module.exports = Writer;