const spacing = () => {
  const parent = document.querySelector('.spacing');
  if (!parent) return;

  const point = document.querySelector('.point strong').textContent;
  const pointLength = document.querySelector('.point span').textContent;

  for (let index = 1; index <= pointLength; index++) {
    const div = document.createElement('div');

    div.textContent = point * index;
    div.style.setProperty('--spacing', `${point * index}px`);
    parent.append(div);
  }

  const except = document.querySelector('.each span');
  const exceptText = except.textContent;
  const parentExcept = document.querySelector('.exception');
  const exceptArry = exceptText
    .split(',')
    .map((item) => item.trim(''))
    .sort((a, b) => a - b);

  for (let index = 0; index < exceptArry.length; index++) {
    const div = document.createElement('div');
    div.textContent = exceptArry[index];
    div.style.setProperty('--spacing', `${exceptArry[index]}px`);
    parentExcept.append(div);
  }

  except.textContent = exceptArry;
};
spacing();
