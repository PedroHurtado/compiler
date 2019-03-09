
module.exports=function interpolate(text){
    let values =[];
    let index=0;
    let startSymbol = '{';
    let endSymbol='}';
    let textLength = text && text.length || 0;
    let startSymbolLength=endSymbolLength = 1; 
    while(index<textLength){
        let start = text.indexOf(startSymbol,index);
        let end = text.indexOf(endSymbol,start+startSymbolLength);
        if(start!==-1 && end!==-1){
            if (index !== start) {
                values.push({text:text.substring(index, start),expression:false});
            }
            let exp = text.substring(start + startSymbolLength, end);
            values.push({text:exp,expression:true});
            index = end + endSymbolLength;
        }else{
            if (index !== textLength) {
                values.push({text:text.substring(index),expression:false});
            }
            break;
        }
    }
    return values;
}


