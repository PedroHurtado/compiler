function render() {
  function _block_context2($) {
    var h1, text;
    return {
      c: function () {
        h1 = create('h1');
        appendAttribute(h1, 'class', 1, 'hello ', $.active ? 'active' : '');
        text = createText(0, 'Hello');
      },
      m: function (target, anchor) {
        append(h1, text, null);
        append(target, h1, anchor);
      },
      u: function (changed, $) {
        updateAttribute(h1, 'class', 1, 'hello ', $.active ? 'active' : '');
      },
      d: function (detach) {
        if (detach) {
          remove(h1);
        }
      }
    };
  }

  function _block_context3($) {
    var h11, text1;
    return {
      c: function () {
        h11 = create('h1');
        text1 = createText(0, 'Esto es una prueba');
      },
      m: function (target, anchor) {
        append(h11, text1, null);
        append(target, h11, anchor);
      },
      u: noop,
      d: function (detach) {
        if (detach) {
          remove(h11);
        }
      }
    };
  }

  function _block_context4($) {
    var li, text2;

    function _handler(event) {
      $.a && $.b && $.c && $.click(name, $.active);
    }

    return {
      c: function () {
        let {
          name
        } = $.car;
        li = create('li');
        createEvent(li, 'click', _handler);
        text2 = createText(1, name);
      },
      m: function (ul, anchor) {
        append(li, text2, null);
        append(ul, li, anchor);
      },
      u: function (changed, $) {
        let {
          name
        } = $.car;
        updateText(text2, 1, name);
      },
      d: function (detach) {
        removeEvent(li, 'click', _handler);

        if (detach) {
          remove(li);
        }
      }
    };
  }

  function _block_context($) {
    var _ifBlock_anchor, ul, _each_anchor;

    function _get_if_block($) {
      if ($.value) return _block_context2;else return _block_context3;
    }

    var _currentIf = _get_if_block($);

    var _ifBlock = _currentIf($);

    var _each = $.items;

    var _each_context = function ($, car) {
      let ctx = Object.create($);
      ctx.car = car;
      return ctx;
    };

    var _each_block = _each.map(ctx => _block_context4(_each_context($, ctx)));

    return {
      c: function () {
        _ifBlock.c();

        _ifBlock_anchor = createComment();
        ul = create('ul');

        _each_block.forEach(each => {
          each.c();
        });

        _each_anchor = createComment();
      },
      m: function (target, anchor) {
        _each_block.forEach(each => {
          each.m(ul, anchor);
        });

        append(ul, _each_anchor, anchor);

        _ifBlock.m(target, anchor);

        append(target, _ifBlock_anchor, anchor);
        append(target, ul, anchor);
      },
      u: function (changed, $) {
        if (_currentIf !== (_currentIf = _get_if_block($))) {
          _ifBlock.d(1);

          _ifBlock = _currentIf($);

          _ifBlock.c();

          _ifBlock.m(_ifBlock_anchor.parentNode, _ifBlock_anchor);
        } else {
          _ifBlock.u(changed, $);
        }

        $.items.forEach((item, i) => {
          const ctx = _each_context($, item, i);

          if (_each_block[i]) {
            _each_block[i].u(changed, ctx);
          } else {
            _each_block[i] = _block_context4(ctx);

            _each_block[i].c();

            _each_block[i].m(_each_anchor.parentNode, _each_anchor);
          }
        });

        _each_block.slice($.items.length).forEach(item => {
          item.d(1);
        });

        _each_block.length = $.items.length;
      },
      d: function (detach) {
        _ifBlock.d(detach);

        _each_block.forEach(each => {
          each.d(detach);
        });

        if (detach) {
          remove(_ifBlock_anchor);
          remove(ul);
          remove(_each_anchor);
        }
      }
    };
  }

  return _block_context;
}

function create(tag) {
  return document.createElement(tag);
}

function append(parent, node, anchor) {
  parent.insertBefore(node, anchor);
}

function createText(flag, ...text) {
  let value = text.join('');
  let node = document.createTextNode(value);
  flag && setState(node, 'data', value);
  return node;
}

function updateText(node, flag, ...text) {
  let value = text.join('');
  let changed = flag && setState(node, 'data', value);

  if (changed) {
    node.data = value;
  }
}

function appendAttribute(node, name, flag, ...values) {
  let value = values.join('').trim();
  flag && setState(node, name, value);

  if (name === 'class') {
    appendClass(node, value);
  } else {
    node.setAttribute(name, value);
  }
}

function updateAttribute(node, name, flag, ...values) {
  let value = values.join('').trim();
  let changed = flag && setState(node, name, value);

  if (changed) {
    if (name === 'class') {
      appendClass(node, value);
    } else {
      node.setAttribute(name, value);
    }
  }
}

function appendClass(node, className) {
  node.className = className;
}

function createEvent(node, event, handler) {
  node.addEventListener(event, handler);
}

function removeEvent(node, event, handler) {
  node.removeEventListener(event, handler);
}

function createComment() {
  return document.createComment('');
}

function setState(node, prop, value) {
  let state = node.__state = node.__state || {};
  let hasProp = prop in state;

  if (!hasProp) {
    state[prop] = value;
    return true;
  } else {
    let changed = state[prop] !== value;

    if (changed) {
      state[prop] = value;
      return true;
    }
  }

  return false;
}

function remove(node) {
  node.parentNode.removeChild(node);
}

function noop() {}

function noopBlock() {
  return {
    c: noop,
    m: noop,
    u: noop,
    d: noop
  };
}