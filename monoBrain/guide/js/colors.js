document.addEventListener('DOMContentLoaded', () => {
  const lists = document.querySelectorAll('.colors');

  if (lists === 0) return;

  lists.forEach((list) => {
    const className = list.getAttribute('class').replace('colors ', '');
    const colorVars = [];

    // 1~999까지 순회하면서 존재하는 CSS 변수 찾기
    for (let i = 1; i <= 999; i++) {
      const varName = `--${className}${i}`;
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

      if (i % 100 === 0 || value) {
        // 100 단위 색상은 없더라도 리스트에 포함
        colorVars.push({ number: i, value: value || 'No color defined' });
      }
    }

    // 존재하는 색상과 100 단위 숫자 리스트 생성
    colorVars.forEach(({ number, value }) => {
      const li = document.createElement('li');
      const span = document.createElement('span');

      // 색상 적용 (있을 경우만 적용)
      if (value !== 'No color defined') {
        span.style.backgroundColor = `var(--${className}${number})`;
      } else {
        span.style.backgroundColor = 'rgba(0,0,0,0.05)'; // 기본 회색
      }

      // 값 삽입
      li.append(span, `${number}`);
      span.insertAdjacentHTML('afterend', `<div>${value}</div>`);

      list.append(li);
    });
  });
});
