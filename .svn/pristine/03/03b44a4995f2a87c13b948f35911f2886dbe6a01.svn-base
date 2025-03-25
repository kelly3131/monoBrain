var transText = {
    일시정지: "일시정지",
    재생: "재생",
    "해석 닫기": "해석 닫기",
    "해석 보기": "해석 보기",
    "예시 대본 전체 닫기": "예시 대본 전체 닫기",
    "예시 대본 전체 열기": "예시 대본 전체 열기",
    선택됨: "선택됨",
    "키보드로 입력하세요.": "키보드로 입력하세요.",
    "손글씨로 쓰세요.": "손글씨로 쓰세요.",
    녹음중: "녹음중",
    녹음하기: "녹음하기",
    "녹음완료(되돌리기)": "녹음완료(되돌리기)",
    "예시 답안 확인": "예시 답안 확인",
    "예시 답안 숨김": "예시 답안 숨김",
    "붓의 크기": "붓의 크기",
    "물감의 색깔": "물감의 색깔",
    "도형 그리기": "도형 그리기",
    지우기: "지우기",
    초기화: "초기화",
    저장: "저장",
    닫기: "닫기",
    "부적절한 단어가 사용되었습니다. 다시 작성하세요.":
      "부적절한 단어가 사용되었습니다. 다시 작성하세요.",
    "선생님께 제출되었습니다.": "선생님께 제출되었습니다.",
};

function toastCheckMsg(context, imgNum, isSubmit){
    const _imgNum = imgNum ? imgNum : 0;
    const _context = context ? context : "";
    const _isSubmit = isSubmit ? isSubmit : false;

    const toastMsg = document.querySelector(".toast_box_wrap")
    if(toastMsg){
        toastMsg.remove();
    }

    const toastMsgArea = document.createElement("div");
    toastMsgArea.classList.add("toast_box_wrap");

    const toastMsgBox = document.createElement("div");
    toastMsgBox.classList.add("toast_box")
    toastMsgArea.appendChild(toastMsgBox)
    
    if(_imgNum){
        const toastImg = document.createElement("img");
        toastImg.src = `../../common_contents/common/img/charactor_toast_${_imgNum}.svg`
        toastImg.classList.add("toast_img")
        toastMsgBox.appendChild(toastImg)
    }

    const toastText = document.createElement("p");
    toastText.setAttribute("lang", "y");
    toastText.innerHTML = _context;

    if(_context == "한 번 더 생각해 보세요."){
        toastText.classList.add("warn")
    }else if(_context == "정답이에요!"){
        toastText.classList.add("crct")
    }

    toastMsgBox.appendChild(toastText)

    // console.log(isSubmit, _isSubmit)

    if(_isSubmit){
        toastMsgBox.classList.add("addon")
        const submitBtnArea = document.createElement("div");
        submitBtnArea.classList.add("submit_btn_area")
        const submitBtn = document.createElement("button");
        submitBtn.classList.add("submit")
        submitBtn.textContent = "제출";
        const cancelBtn = document.createElement("button");
        cancelBtn.classList.add("cancel")
        cancelBtn.textContent = "취소"

        submitBtnArea.appendChild(cancelBtn)
        submitBtnArea.appendChild(submitBtn)

        toastMsgBox.appendChild(submitBtnArea)

        cancelBtn.addEventListener("click", () => toastMsgArea.remove()); // 버튼 클릭시 닫기
        submitBtn.addEventListener("click", () => toastMsgArea.remove()); // 버튼 클릭시 닫기
    }else{
        setTimeout(()=>toastMsgArea.remove(), 2000)
        // toastMsgArea.addEventListener("click", () => toastMsgArea.remove()); // 배경 클릭 시 닫기
    }

    document.getElementById("app_wrap").appendChild(toastMsgArea);
}