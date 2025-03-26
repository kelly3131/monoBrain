/**
 * 전역변수
 */
// 전역 스케일 값
let globalScale = 1;
let globalFaultCount = 0; // 모든 입력 필드에서 공통으로 사용되는 오답 카운트
let penModeState = {
    isPenMode: false,
};
let isPaging = false; //페이징 기능 사용 여부

// 배운내용 확인하기 카드 플립 기능 변수
const cardFlip = {
    cards: []
};

// 초기 실행 및 창 크기 변경 시 대응
window.addEventListener("DOMContentLoaded", scaleScreen);
window.addEventListener("resize", scaleScreen);

function loadScriptAsync(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.type = "text/javascript";
        script.onload = () => resolve(src); // 로드된 파일 경로 반환
        script.onerror = () => reject(new Error(`Script load error: ${src}`));
        document.head.append(script);
    });
}

// 로드할 스크립트 목록
const scriptPaths = [
    "../../common_contents/common/js/audio.js",//공통 오디오 셋업
    "../../common_contents/common/js/dynamic_tag.js",//태그 동적 생성 셋업
    "../../common_contents/common/js/scrollbar.js",//컨텐츠 커스텀 스크롤바 관련
    "../../common_contents/common/js/dropdown.js",//커스텀 드롭다운 셀랙트박스 관련
    "../../common_contents/common/js/pagenation.js",//커스텀 드롭다운 셀랙트박스 관련
    "../../common_contents/common/js/toast_message.js",//알림창 및 팝업 관련
    "../../common_contents/common/js/video_player.js",//비디오 플레이어 UI 관련 기능
    "../../common_contents/common/js/btn_act.js",//정오답 체크 관련 기능
    "../../common_contents/common/js/write.js",//입력 유형 선택 기능
    "../../common_contents/common/js/drawline.js",//연결선 그리기 관련 기능
    "../../common_contents/common/js/drag_drop.js",//드래그 앤 드랍 관련 기능
    "../../common_contents/common/js/image_zoom.js",//이미지 확대하기 기능
    "../../common_contents/common/js/problem_generator.js",//문제만들기 기능
    "../../common_contents/common/js/badwords.js",//금칙어 기능(기존 기능 이식)
];

// 모든 스크립트 로드 후 실행
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await Promise.all(scriptPaths.map(loadScriptAsync)); // 모든 스크립트 로드 대기

        console.log("모든 스크립트가 로드되었습니다.");

        /** 모든 스크립트가 로드된 후 실행할 코드 추가 ***********************************************************************/
        
        /** 배운내용 확인하기 카드 플립 기능 실행 */
        initializeCardFlip();
       
    } catch (error) {
        console.error("스크립트 로드 실패:", error);
    }
});



/**
 * 기타 공통 기능 함수들
 */
/****************************************************************************************************************/
/** 화면 스케일링 */
function scaleScreen() {
    const container = document.getElementById("app_wrap");
    if (!container) return;

    const scaleX = window.innerWidth / 1715; // 너비 기준 비율
    const scaleY = window.innerHeight / 764; // 높이 기준 비율
    globalScale = Math.min(scaleX, scaleY); // 전역 스케일 값 업데이트

    container.style.transform = `scale(${globalScale})`;
}
/****************************************************************************************************************/
function updateGlobalFaultCount(newCount) {
    globalFaultCount = newCount; // 전역 변수 변경
    document.dispatchEvent(new CustomEvent("globalFaultUpdated", { detail: globalFaultCount })); // 이벤트 발생
}
// 전역 변수 변경 이벤트 감지 함수 사용은 아래의 형태와 같이 사용
// document.addEventListener("globalFaultUpdated", (event) => {
//     if(event.detail > 1){}
// });
/****************************************************************************************************************/

/****************************************************************************************************************/
/** 카드 플립 기능을 초기화하는 함수 */
function initializeCardFlip() {
    cardFlip.cards = Array.from(document.querySelectorAll(".letCheck li"));
    
    cardFlip.cards.forEach(card => {
        card.addEventListener("click", () => handleCardClick(card));
    });
}

/** 카드 클릭 이벤트 핸들러 */
function handleCardClick(card) {
    const cover = card.querySelector(".cover");
    
    if (cover && !cover.classList.contains("removed")) {
        cover.classList.add("removed"); // 커버 제거 플래그 추가
        cover.remove(); // 첫 클릭 시 cover 제거
    } else {
        if(card.querySelector(".back")){
            card.classList.toggle("flip"); // 두 번째 클릭부터 카드 뒤집기
        }
    }
    
    audioManager.playSound("click");
}
/****************************************************************************************************************/
/** 네비게이션 기능*/
async function navigate(dir) {
    const clickAudio = audioManager.audioElements['click'];
    
    if (clickAudio) {//버튼 클릭 오디오 실행 후 기능 실행
        await new Promise(resolve => {
            clickAudio.onended = resolve;
            clickAudio.play().catch(resolve);
        });
    }
    // 추가 기능 실행 및 완료 대기
    // await 함수();

    if (dir === 'back') {
        window.history.back();
    } else {
        window.location.href = `${dir}.html`;
    }
}


/****************************************************************************************************************/
/** 클래스 선택자 팝업 제어 기능 함수 */
function openPop(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = 'block';
    }
}

function closePop(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = 'none';
    }
}
/****************************************************************************************************************/
