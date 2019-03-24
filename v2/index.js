const fs = require("fs");
const path = require("path");
const transformHtml = require("./transforhtml");
const transformJs = require("./transformjs");

let filename = "./v2/x.html";
let exportName = path.parse(filename).name;
let html = fs.readFileSync(filename, "utf-8");

let newFilename = path.format({
  name: `./v2/${exportName}`,
  ext: ".js"
});

let code = transformJs(transformHtml(html));

fs.writeFileSync(newFilename, code);