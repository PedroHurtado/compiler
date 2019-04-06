const postcss = require('postcss');
const prefixer = require('postcss-prefix-selector')
const loadPostcssConfig = require('postcss-load-config');
const CSSselect = require("css-select");
const cssnano = require('cssnano');
const crypto = require('crypto');

const TEXT_NODE = 'text';
const LINE_BREAK = '\n';
const SELECTORS_MATCHER = /([\s\S]*?)\{[\s\S]+?\}/g;
const defaultConfig = { plugins: [cssnano()], options: {} };

async function generateCSS(styles, file, nodes, usePrefix) {
  let prefix;
  const rawCSS = getCSS(styles);
  const selectors = getSelectors(rawCSS);
  const config = await loadConfig();
  if (usePrefix) {
    prefix = `c_${createHash(file)}`;
    config.plugins.push(prefixer({
      transform: function (_, selector) {
        return `.${prefix}${selector}`;
      }
    }));
  }
  const { css } = await processCSS(rawCSS, config, file);
  usePrefix && prefixNodes(nodes, selectors, prefix);
  return { css };
}

function getSelectors(css) {
  const selectors = [];
  let match;
  while (match = SELECTORS_MATCHER.exec(css)) {
    selectors.push(match[1]);
  }
  SELECTORS_MATCHER.lastIndex = 0;
  return selectors.map(s => s.trim());
}

async function loadConfig() {
  try {
    return loadPostcssConfig();
  } catch (err) {
    return defaultConfig;
  }
}

async function processCSS(rawCSS, config, file) {
  const { css } = await postcss(config.plugins)
    .process(rawCSS, {
      ...config.options,
      from: file,
      map: config.options.map && { inline: true, annotation: true }
    });
  return { css };
}

function getCSS(styles) {
  return styles.map((style) => {
    return style.childNodes
      .filter(({ type }) => type === TEXT_NODE)
      .map(({ nodeValue }) => nodeValue)
      .join(LINE_BREAK)
  }).join(LINE_BREAK);
}

function createHash(str) {
  return crypto
    .createHash('sha256')
    .update(str)
    .digest('hex')
    .substr(0, 7);
}

function prefixNodes(nodes, selectors, prefix) {
  selectors.forEach((selector) => {
    CSSselect(selector, nodes).forEach(addPrefix.bind(null, prefix));
  });
  nodes.filter(mustPrefix).forEach(addPrefix.bind(null, prefix));
}

function mustPrefix(node) {
  return node.type === 'tag' && hasDynamicAttr(node);
}

function hasDynamicAttr(element) {
  return Object.entries(element.attribs)
    .some(([name, value]) => {
      return !name.includes(':') && !!value.match(/\{(?:[\s\S]+?)\}/g)
    });
}

function addPrefix(prefix, node) {
  const currentClass = node.attribs.class;
  const newClass = (currentClass && !currentClass.includes(prefix)) ? `${prefix} ${currentClass}` : prefix;
  node.attribs.class = newClass;
}

module.exports = {
  generateCSS
};
