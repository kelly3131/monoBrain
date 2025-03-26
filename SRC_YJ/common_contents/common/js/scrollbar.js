/**
 * .contents 스크롤 자동 생성 기능
 */

// .contents 스크롤 자동 생성 기능 변수
const customScrollData = {
    container: null, // 스크롤이 적용될 요소
    scrollbar: null, // 동적 스크롤바
    thumb: null, // 스크롤 핸들
    isDragging: false,
    startY: 0,
    startScrollTop: 0,
};

// 특정 요소에 커스텀 스크롤바 적용 (초기화)
function initCustomScrollbar(containerSelector) {
    customScrollData.container = document.querySelector(containerSelector);
    if (!customScrollData.container) return;

    // 기존 스크롤바 삭제
    const existingScrollbar = customScrollData.container.querySelector(".dynamic-scrollbar");
    if (existingScrollbar) existingScrollbar.remove();

    // 스크롤이 필요한 경우만 동적 스크롤바 생성
    if (customScrollData.container.scrollHeight > customScrollData.container.offsetHeight) {
        createCustomScrollbar();
        updateCustomScrollbar();
        attachCustomScrollbarEvents();
    }
}

// 동적 스크롤바 생성
function createCustomScrollbar() {
    customScrollData.scrollbar = document.createElement("div");
    customScrollData.scrollbar.classList.add("dynamic-scrollbar");

    customScrollData.thumb = document.createElement("div");
    customScrollData.thumb.classList.add("dynamic-scrollbar-thumb");

    customScrollData.scrollbar.appendChild(customScrollData.thumb);
    customScrollData.container.appendChild(customScrollData.scrollbar);
}

// 스크롤 핸들 크기 및 위치 업데이트
function updateCustomScrollbar() {
    const { container, scrollbar, thumb } = customScrollData;
    const visibleHeight = container.offsetHeight;
    const barHeight = document.getElementById('app_wrap').offsetHeight - 130;
    const contentHeight = container.scrollHeight;
    const thumbHeight = barHeight * visibleHeight / contentHeight; // 비율 계산

    scrollbar.style.height = `${barHeight}px`;
    thumb.style.height = `${thumbHeight}px`;

    // 스크롤 위치에 따른 핸들 이동
    const scrollRatio = container.scrollTop / (contentHeight - visibleHeight);
    thumb.style.top = `${scrollRatio * (barHeight - thumbHeight)}px`;
}

// 스크롤 핸들 드래그 시작
function startCustomScrollbarDrag(yPosition) {
    customScrollData.isDragging = true;
    customScrollData.startY = yPosition;
    customScrollData.startScrollTop = customScrollData.container.scrollTop;

    // 🔹 다른 요소 드래깅 방지
    document.body.style.pointerEvents = "none";

    document.addEventListener("mousemove", onCustomScrollbarDrag);
    document.addEventListener("mouseup", stopCustomScrollbarDrag);
    document.addEventListener("touchmove", onCustomScrollbarDrag);
    document.addEventListener("touchend", stopCustomScrollbarDrag);
}

// 스크롤 핸들 드래그 중
function onCustomScrollbarDrag(e) {
    if (!customScrollData.isDragging) return;

    const currentY = e.clientY || e.touches[0].clientY;
    const deltaY = currentY - customScrollData.startY;
    const visibleHeight = customScrollData.container.offsetHeight;
    const contentHeight = customScrollData.container.scrollHeight;
    const scrollableDistance = contentHeight - visibleHeight;

    // 스크롤 이동 비율 계산
    const scrollRatio = scrollableDistance / (visibleHeight - customScrollData.thumb.clientHeight);
    customScrollData.container.scrollTop = customScrollData.startScrollTop + deltaY * scrollRatio;
}

// 스크롤 핸들 드래그 종료
function stopCustomScrollbarDrag() {
    customScrollData.isDragging = false;

    // 🔹 다른 요소 드래깅 허용
    document.body.style.pointerEvents = "";

    document.removeEventListener("mousemove", onCustomScrollbarDrag);
    document.removeEventListener("mouseup", stopCustomScrollbarDrag);
    document.removeEventListener("touchmove", onCustomScrollbarDrag);
    document.removeEventListener("touchend", stopCustomScrollbarDrag);
}

// 스크롤바 트랙 클릭 시 해당 위치로 이동
function onCustomScrollbarTrackClick(e) {
    if (e.target !== customScrollData.thumb) { // 스크롤 핸들(thumb)이 아닌 경우 실행
        const clickPositionY = e.clientY - customScrollData.scrollbar.getBoundingClientRect().top;
        const visibleHeight = customScrollData.container.offsetHeight;
        const contentHeight = customScrollData.container.scrollHeight;
        const thumbHeight = customScrollData.thumb.clientHeight;

        // 스크롤 이동 비율 계산
        const scrollRatio = (clickPositionY - thumbHeight / 3) / (visibleHeight - thumbHeight);
        const newScrollTop = scrollRatio * (contentHeight - visibleHeight);

        // 부드러운 스크롤 이동
        customScrollData.container.scrollTo({
            top: newScrollTop
        });
    }
}

// 스크롤바 관련 이벤트 리스너 추가
function attachCustomScrollbarEvents() {
    customScrollData.container.addEventListener("scroll", updateCustomScrollbar);
    window.addEventListener("resize", updateCustomScrollbar);

    // 핸들 드래그 이벤트 추가
    customScrollData.thumb.addEventListener("mousedown", (e) => startCustomScrollbarDrag(e.clientY));
    customScrollData.thumb.addEventListener("touchstart", (e) => startCustomScrollbarDrag(e.touches[0].clientY));

    // 트랙 클릭 이벤트 추가
    customScrollData.scrollbar.addEventListener("click", onCustomScrollbarTrackClick);
}

/** .contents 스크롤 자동 생성 기능 */
initCustomScrollbar(".contents");

// 디바운스 유틸리티 함수 (불필요한 호출 방지)
function debounce(func, delay = 100) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

// 글로벌 MutationObserver와 ResizeObserver 선언
let mutationObserver;
let resizeObserver;

// 요소 변화 감지 및 스크롤바 재설정 (디바운스 적용)
function observeContentChanges() {
    const container = document.querySelector(".contents");
    if (!container) return;

    const debouncedInitScrollbar = debounce(() => {
        if (mutationObserver) mutationObserver.disconnect(); // 🔹 MutationObserver 비활성화
        initCustomScrollbar(".contents");
        if (mutationObserver) mutationObserver.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] }); // 🔹 다시 활성화
    });

    // 📌 DOM 변경 감지 (자식 추가/제거, 속성 변경 → 높이 변화 포함, scroll 변화 제외)
    mutationObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "attributes" && mutation.attributeName === "style") {
                const computedStyle = window.getComputedStyle(mutation.target);
                const prevHeight = mutation.oldValue ? mutation.oldValue.match(/height:\s*(\d+)px/) : null;
                const newHeight = computedStyle.height;
                
                if (prevHeight && prevHeight[1] === newHeight) return; // 높이가 동일하면 무시

                // 🔹 `scrollTop` 변화 감지 차단
                if (mutation.target.scrollTop !== 0) return;
            }
            debouncedInitScrollbar();
            break; // 🔹 한 번만 실행되도록 처리
        }
    });

    mutationObserver.observe(container, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["style", "class"] });

    // 📌 요소 크기 변화 감지 (높이 변경 체크, scroll 변화 제외)
    resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            const { height: newHeight } = entry.contentRect;
            const oldHeight = entry.target.dataset.prevHeight || 0;
            entry.target.dataset.prevHeight = newHeight;

            if (oldHeight == newHeight) return; // 높이가 변하지 않았다면 실행 X
        }
        debouncedInitScrollbar();
    });
    resizeObserver.observe(container);
}

// ✅ 스크롤바 감지 기능 실행
observeContentChanges();
