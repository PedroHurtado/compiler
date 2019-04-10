const transformHtml = require('../transforhtml.js');
const transformJs = require("../transformjs.js");
module.exports = function(source){
    let callback = this.async();
    return transformHtml(source, '').then((code) => {
        callback(null,transformJs(code));
    });
}