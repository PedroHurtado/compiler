const fs = require("fs");
const path = require("path");
const transformHtml = require("./transforhtml");
const transformJs = require("./transformjs");

(async function () {
  let filename = process.argv[2];
  let { name, dir } = path.parse(filename);
  let html = fs.readFileSync(filename, "utf-8");
  let newFilename = path.format({
    dir: dir,
    name: name,
    ext: ".js"
  });
  let code = transformJs(await transformHtml(html, filename));
  fs.writeFileSync(newFilename, code);
}());
