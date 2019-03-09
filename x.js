function render() {
  if (value) {
    let $$_h1 = append(target, 'h1');
    appendAttribute($$_h1, 'class', 'hello ', active ? 'active' : '');
    let $$_text = appendText($$_h1, 'Hello');
  } else {
    let $$_h11 = append(target, 'h1');
    let $$_text1 = appendText($$_h11, 'Esto es una prueba');
  }

  let $$_ul = append(target, 'ul');
  items.forEach(car => {
    let {
      name
    } = car;
    let $$_li = append($$_ul, 'li');
    appendEvent($$_li, 'click', click(name, active));
    let $$_text2 = appendText($$_li, name);
  });
}