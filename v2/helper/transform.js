const {ISSEALDED} = require("./constans");
const LITERAL = "Literal";



function hasExpression(args) {
  let exp = args.filter(c => {
    return c.type.indexOf(LITERAL) === -1;
  });
  return ISSEALDED(exp.length);
}
function transformText(args, block) {
  let [key, ...next] = args;
  let sealed = hasExpression(args);
  let newArgs = [
    block.key,
    block.subKey,
    block.each || block.nodeIndex,
    key,
    sealed,
    ...next
  ];
  return newArgs;
}
function transformAppend(args, block) {
  let [key, ...next] = args;
  let newArgs = [
    block.key,
    block.subKey,
    block.each || block.nodeIndex,
    key,
    ...next
  ];
  return newArgs;
}
function transformAttribute(args) {
  let sealed = hasExpression(args);
  let newArgs = [sealed, ...args];
  return newArgs;
}



module.exports = {
  transformAppend,
  transformText,
  transformAttribute
};
