//정오답 입력시 만들어둔 style 변경 되는 코드
function checkAnswer(page) {
  if (page === "page1") {
    console.log("checkAnswer 함수 호출됨");

    const inputElement = document.querySelector("#page1 .num1");
    const userAnswer = inputElement.value.trim();
    const correctAnswer = inputElement.getAttribute("data-answer-single");
    const gridItems = document.querySelectorAll("#page1 .grid-item");
    const container = document.querySelector("#page1 .container");

    if (userAnswer === correctAnswer) {
      console.log("정답입니다!");
      gridItems.forEach((item, index) => {
        item.textContent = index + 1;
        item.classList.add("answered");
        item.style.backgroundColor = "#e6e0f8"; // 배경색 변경
        item.style.border = "4px solid #673ab7"; // 실선 색 변경
      });
      container.style.border = "1px solid #673ab7"; // 보라색 실선 테두리로 변경
      container.style.backgroundColor = "#e6e0f8"; // 배경색 변경
    } else {
      console.log("오답입니다. 다시 시도해보세요.");
      resetGrid(page); // 오답이면 스타일 초기화
    }
  }
}

function resetGrid(page) {
  if (page === "page1") {
    console.log("resetGrid 함수 호출됨");

    const gridItems = document.querySelectorAll("#page1 .grid-item");
    const container = document.querySelector("#page1 .container");

    container.removeAttribute("style");
    container.style.border = "2px dashed #00A0E9"; // 기본 점선 테두리 복원
    container.style.backgroundColor = ""; // 배경색 초기화

    gridItems.forEach((item) => {
      item.textContent = "1cm²";
      item.classList.remove("answered");
      item.style.border = "1px dashed #00A0E9"; // 기본 점선 테두리 복원
      item.style.backgroundColor = ""; // 배경색 초기화
    });
  }
}
