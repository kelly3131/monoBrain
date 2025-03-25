import { removeClass } from './helper.js';

export const frame = () => {
  const links = document.querySelectorAll('.sidebar a');
  const frame = document.querySelector('iframe');
  const frameSrc = sessionStorage.getItem('src');
  if (!frame) return;

  // 프레임CSS
  const frameCSS = () => {
    const style = frame.contentWindow.document.createElement('style');
    style.textContent = /* css */ `
      body{ 
        &::-webkit-scrollbar {
          width: 10px;
          background-color: rgba(0, 0, 0, 0.02);
        }
        &::-webkit-scrollbar-thumb {
          width: 10px;
          border-radius: 1000px;
          background-color: rgba(0, 0, 0, 0.05);
        }
        @media (width < 1280px) {
          padding:0 20px 20px;
        }
        > h2:not([class]) {
          margin-block:40px 20px;
          font-size:20px;
          &:first-child {
            margin-top:0;
          }
        }
      }
      .guide-block {
        border:1px dashed #7c7c7c;
        padding:10px;
        margin-block:10px;
        &.align[class*="v"] {
          height:80px;
        }
      }
    `;
    frame.contentWindow.document.head.append(style);
  };

  if (frameSrc) {
    frame.setAttribute('src', frameSrc);
    links.forEach((link) => {
      const linkText = link.textContent.toLocaleLowerCase();

      if (frameSrc.includes(linkText)) {
        removeClass(links);
        link.classList.add('active');
      }
    });
  }

  frame.onload = () => {
    frameCSS();
  };
};
