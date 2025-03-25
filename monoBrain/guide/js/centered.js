export const centered = () => {
  const links = document.querySelectorAll(".sidebar a");

  const handleOffset = (e) => {
    const x = e.target.offsetLeft;
    const xWidth = e.target.closest("nav").offsetWidth / 2;
    const button = e.target.offsetWidth / 2;
    const width = xWidth - button;
    e.target.closest("nav").scrollTo(x - width, 0);
  };

  links.forEach((link) => {
    link.addEventListener("click", handleOffset);
  });
};
