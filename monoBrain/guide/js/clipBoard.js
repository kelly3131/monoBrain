export const copy = async () => {
  const copyItems = document.querySelectorAll('.copy');

  copyItems.forEach((item) => {
    const btn = document.createElement('button');
    btn.innerText = '복사';
    btn.classList.add('btn-copy');
    item.prepend(btn);
  });

  const buttons = document.querySelectorAll('.btn-copy');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      let content = '';
      let sibling = button.nextElementSibling;

      while (sibling) {
        content += sibling.outerHTML + '\n'; // 모든 다음 형제 요소 HTML 포함
        sibling = sibling.nextElementSibling;
      }

      if (!content.trim()) {
        console.log('복사할 대상이 없습니다.');
        return;
      }

      navigator.clipboard
        .writeText(content)
        .then(() => {
          button.innerText = '복사됨!';
          button.classList.add('active');

          setTimeout(() => {
            button.classList.remove('active');
            button.innerText = '복사';
          }, 1000);
        })
        .catch((err) => console.error('복사 실패:', err));
    });
  });
};

const css = () => {
  const head = document.querySelector('head');
  const style = document.createElement('style');
  const css = /* css */ `
    body {
      padding:2rem;
    }
    .copy-group {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(20rem, 1fr));
      gap:1rem;
      .copy {
        margin:0;
      }
    }
    .copy {
      position:relative;
      border:2px dashed gray;
      padding:1rem;
      margin-block:2rem 3rem;
      min-height:1rem;
      .btn-copy {
        position:absolute;
        right:0;
        top:0;
        z-index:100;
        padding:0.7rem 1rem;
        background:#000;
        color:#fff;
        font-size:1.4rem;
      }
    }
  `;
  style.textContent = css;
  if (!head.querySelector('style')) {
    head.append(style);
  }
};
copy();
css();
