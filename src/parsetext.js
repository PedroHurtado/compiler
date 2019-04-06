module.exports = function parseText(str) {
  let i = 0;
  let r = /(?:(t)|(html))`([\s\S]+?)`/g;
  r.lastIndex =0;
  let statements = [];
  let match;
  while (match = r.exec(str)) {
    let index = match.index;
    let type = match[1] || match[2];
    let text = match[3];
    if (i !== index) {
      statements.push({ type: 'j', text: str.substring(i, index) });
    }
    statements.push({ type, text })
    i = index + match[0].length;
  }
  statements.push({ type: 'j', text: str.substring(i) });
  return statements;
};