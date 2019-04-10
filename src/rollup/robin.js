const transformHtml = require('../transforhtml.js');
const transformJs = require("../transformjs.js");
const path = require('path');
module.exports = function robin(options = {}) {
    return {
        name: 'robin',
        transform: function (code, id) {
            const extension = path.extname(id);
            if(extension !== '.html'){
                return null;
            }
            return transformHtml(code, '').then((code) => {
                return {
                    code:transformJs(code),
                    map: { mappings: '' }
                }
            });
        }
    }
}