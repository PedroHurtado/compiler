module.exports = function sytleAttribute(value){
    return value.split(';')
        .map(prop=>prop.split(':'))
        .filter(prop=>prop.length>1);
}