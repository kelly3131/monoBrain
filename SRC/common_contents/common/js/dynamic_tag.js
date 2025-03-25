/** 헤딩 타이틀 */
//타이틀 단원 숫자 자동 삽입
document.querySelectorAll(".title h1[data-number]").forEach(h1 => {
    const numberStr = h1.dataset.number; // data-number 값 가져오기
    const numberArray = numberStr.split(""); // 숫자를 한 글자씩 배열로 변환
    
    // 숫자들을 감쌀 span 태그 생성
    const numberWrapper = document.createElement("span");
    numberWrapper.classList.add("number_images"); // CSS 스타일을 위한 클래스 추가

    // 숫자별 이미지 태그 생성 및 추가
    numberArray.forEach(num => {
        const img = document.createElement("img");
        img.src = `../../common_contents/common/img/title_heading_${num}.svg`;
        img.alt = `숫자 ${num}`;

        numberWrapper.appendChild(img); // span 안에 이미지 추가
    });

    h1.prepend(numberWrapper); // h1 태그의 기존 텍스트 앞에 숫자(span) 삽입
});

document.querySelectorAll("h2[data-type]").forEach(h2 => {
    const typeValue = h2.dataset.type; // data-type 값 가져오기
    const titleText = h2.dataset.text; // data-type 값 가져오기
    const digit = typeValue.replace(/\D/g, ""); // 숫자만 남기고 제거

    if (digit) {
        const img = document.createElement("img");
        const titleHead = document.createElement("div");
        titleHead.classList.add('title_head')
        img.src = `../../common_contents/common/img/title_mid_${digit}.svg`; // 이미지 파일명 구성
        digit == '1'
        ? (
            img.alt = '자기주도',
            titleHead.innerText = titleText
        )
        : digit == '2'
        ? (
            img.alt = '생각 깨우기',
            titleHead.innerText = titleText
        )
        : null
        
        h2.prepend(titleHead)
        titleHead.prepend(img); // h2 태그 텍스트 앞에 이미지 삽입
    }
});

document.querySelectorAll("h2[data-icon]").forEach(h2 => {
    const iconName = h2.dataset.icon; // data-type 값 가져오기

    if (iconName) {
        const img = document.createElement("img");
        img.src = `../../common_contents/common/img/icon_${iconName}.svg`; // 이미지 파일명 구성
        img.art = `icon_${iconName}`

        h2.prepend(img); // h2 태그 텍스트 앞에 이미지 삽입
    }
});

document.querySelectorAll("h2[data-head]").forEach(h2 => {
    const headText = h2.dataset.head; // data-type 값 가져오기

    if (headText) {
        const heading = document.createElement("span");
        heading.classList.add('heading')
        heading.innerText = headText; // 이미지 파일명 구성

        h2.prepend(heading); // h2 태그 텍스트 앞에 이미지 삽입
    }
});

/****************************************************************************************************************/
/** 정오답 체크 기능 */
// 문서 로드 시 정답 힌트 자동 생성
const elements = document.querySelectorAll(".input_wrap input[data-answer-single], .input_wrap textarea[data-answer-single], .custom_dropdown[data-answer-single]");
if (elements.length > 0) {
    elements.forEach(element => {
        createHint(element);
    });
}

// 문서 로드 시 input, textarea에 플레이스 홀더 자동생성
document.querySelectorAll(".input_wrap input, .input_wrap textarea").forEach(element => {
    if (!element.hasAttribute("placeholder") || element.placeholder.trim() === "") {
        element.setAttribute("placeholder", "\u200B"); // 빈값 설정
    }
});

/** ✅ 정답 힌트 생성 */
function createHint(element) {
    removeHint(element); // 기존 힌트 제거

    const hint = document.createElement("p");
    hint.classList.add("text_hint");

    const answerText = element.dataset.answerSingle?.trim() || "";
    hint.textContent = answerText;

    // ✅ 텍스트가 숫자가 아닌 경우 lang="y" 부여
    if (answerText && isNaN(Number(answerText))) {
        hint.setAttribute("lang", "y");
    }

    // 🔹 custom_dropdown 처리
    if (element.classList.contains("custom_dropdown")) {
        setTimeout(() => {
            const customSelect = element.nextElementSibling;
            if (customSelect && customSelect.classList.contains("custom_select")) {
                customSelect.appendChild(hint);
            }
        }, 100);
    } else {
        // 일반 input / textarea
        element.parentNode.insertBefore(hint, element.nextSibling);
    }
}

/* 힌트 제거 */
function removeHint(element) {
    const existingHint = element.parentNode.querySelector(".text_hint");
    if (existingHint) existingHint.remove();
}