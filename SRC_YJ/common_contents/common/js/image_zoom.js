// 이미지 줌 인아웃 및 드래그 기능 변수
const imageZoom = {
    scale: 1,
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
    touchStartX: 0,
    touchStartY: 0,
    imgWidth: 0,
    imgHeight: 0,
};

// 앱 컨테이너
const appWrap = document.querySelector("#app_wrap");

// ✅ `.picture_wrap` 내의 SVG + 이미지 구조 그대로 유지하여 팝업 생성
document.querySelectorAll(".picture_wrap").forEach((picture) => {
    const zoomBtn = picture.querySelector(".zoom");

    zoomBtn.addEventListener("click", () => {
        if (document.querySelector(".pop_area")) return; // 중복 실행 방지

        const titleText = document.querySelector("section.title h2");

        const pureText = Array.from(titleText.childNodes)
            .filter(node => node.nodeType === 3) // 텍스트 노드만 필터링 (하위 태그 제거)
            .map(node => node.textContent.trim()) // 공백 제거
            .join(" "); // 여러 개일 경우 합치기

        const dataHead = picture.dataset.head || "";
        const dataTit = picture.dataset.tit || pureText;

        // 🔹 `<svg>` 요소를 복사
        const svgElement = picture.querySelector("svg") ? picture.querySelector("svg").cloneNode(true) : null;

        // 🔹 `<img>` 요소를 복사
        const imgElement = picture.querySelector("img") ? picture.querySelector("img").cloneNode(true) : null;

        if (!svgElement && !imgElement) return; // 이미지와 SVG가 없으면 실행 중지

        // 🔹 SVG 및 이미지 구조 그대로 포함
        const contentContainer = document.createElement("div");
        contentContainer.classList.add("image-content");
        if (svgElement) contentContainer.appendChild(svgElement);
        if (imgElement) contentContainer.appendChild(imgElement);

        // 팝업 생성
        const popArea = document.createElement("div");
        popArea.classList.add("pop_area");
        popArea.innerHTML = `
            <div class="image_zoom_wrap">
                <div class="title">
                    <h3 lang="y">${dataHead ? "<span>" + dataHead + "</span>": ""}${dataTit}</h3>
                    <button class="close"></button>
                </div>
                <div class="image_zoom scrollable"></div>
                <div class="controller">
                    <button class="scale_down"></button>
                    <button class="scale_up"></button>
                </div>
            </div>
        `;

        // `.image_zoom` 내부에 SVG + 이미지 삽입
        popArea.querySelector(".image_zoom").appendChild(contentContainer);
        appWrap.appendChild(popArea);

        // 팝업 닫기 기능
        popArea.querySelector(".close").addEventListener("click", () => {
            imageZoom.scale = 1;
            popArea.remove()
        });

        // 확대/축소 및 드래그 기능 초기화
        initializeZoomAndMove();
    });
});

/** 이미지 및 SVG 확대 및 드래그 기능 초기화 */
function initializeZoomAndMove() {
    if (document.querySelector(".image_zoom").dataset.init === "true") return;

    const imgWrap = document.querySelector(".image_zoom");
    const content = imgWrap.querySelector(".image-content"); // 🔹 SVG + IMG 포함 컨테이너
    const scaleUpBtn = document.querySelector(".scale_up");
    const scaleDownBtn = document.querySelector(".scale_down");

    // ✅ 원본 크기 저장
    imageZoom.imgWidth = imgWrap.offsetWidth;
    imageZoom.imgHeight = imgWrap.offsetHeight;

    // 이벤트 리스너 등록
    scaleUpBtn.addEventListener("click", zoomInImage);
    scaleDownBtn.addEventListener("click", zoomOutImage);
    imgWrap.addEventListener("mousedown", startImageMove);
    imgWrap.addEventListener("mousemove", onImageMove);
    document.addEventListener("mouseup", stopImageMove);
    imgWrap.addEventListener("touchstart", startTouchImageMove);
    imgWrap.addEventListener("touchmove", onTouchImageMove);
    imgWrap.addEventListener("touchend", stopImageMove);

    imgWrap.dataset.init = "true";
}

/** 이미지 확대 */
function zoomInImage() {
    if (imageZoom.scale < 2) {
        imageZoom.scale += 0.5;
        updateImageSize(true);
    }
}

/** 이미지 축소 */
function zoomOutImage() {
    if (imageZoom.scale > 1) {
        imageZoom.scale -= 0.5;
        updateImageSize(imageZoom.scale > 1);
    }
}

/** 이미지 크기 업데이트 */
function updateImageSize(center = false) {
    const content = document.querySelector(".image_zoom .image-content");
    const imgWrap = document.querySelector(".image_zoom");

    if (!imageZoom.imgWidth || !imageZoom.imgHeight || imageZoom.scale === 1) {
        content.style.removeProperty("width");
        content.style.removeProperty("height");
    } else {
        const newWidth = imageZoom.imgWidth * imageZoom.scale;
        const newHeight = imageZoom.imgHeight * imageZoom.scale;

        content.style.width = `${newWidth}px`;
        content.style.height = `${newHeight}px`;
    }

    imgWrap.style.overflow = imageZoom.scale > 1 ? "auto" : "hidden";

    if (center) {
        imgWrap.scrollLeft = (imgWrap.scrollWidth - imgWrap.clientWidth) / 2;
        imgWrap.scrollTop = (imgWrap.scrollHeight - imgWrap.clientHeight) / 2;
    } else if (imageZoom.scale === 1) {
        imgWrap.scrollLeft = 0;
        imgWrap.scrollTop = 0;
    }
    
    imageZoom.scale > 1
    ? imgWrap.classList.add('grab')
    : imgWrap.classList.remove('grab')
}

/** 이미지 드래그 시작 */
function startImageMove(e) {
    if (imageZoom.scale > 1) {
        imageZoom.isDragging = true;
        imageZoom.startX = e.clientX;
        imageZoom.startY = e.clientY;
        imageZoom.scrollLeft = e.currentTarget.scrollLeft;
        imageZoom.scrollTop = e.currentTarget.scrollTop;
    }
}

/** 이미지 드래그 이동 */
function onImageMove(e) {
    if (!imageZoom.isDragging) return;
    const imgWrap = document.querySelector(".image_zoom");
    imgWrap.scrollLeft = imageZoom.scrollLeft + (imageZoom.startX - e.clientX) * imageZoom.scale;
    imgWrap.scrollTop = imageZoom.scrollTop + (imageZoom.startY - e.clientY) * imageZoom.scale;
}

/** 드래그 종료 */
function stopImageMove() {
    imageZoom.isDragging = false;
}

/** 터치 드래그 시작 */
function startTouchImageMove(e) {
    if (imageZoom.scale > 1) {
        imageZoom.isDragging = true;
        imageZoom.touchStartX = e.touches[0].clientX;
        imageZoom.touchStartY = e.touches[0].clientY;
        imageZoom.scrollLeft = e.currentTarget.scrollLeft;
        imageZoom.scrollTop = e.currentTarget.scrollTop;
    }
}

/** 터치 드래그 이동 */
function onTouchImageMove(e) {
    if (!imageZoom.isDragging || e.touches.length !== 1) return;
    const imgWrap = document.querySelector(".image_zoom");
    imgWrap.scrollLeft = imageZoom.scrollLeft + (imageZoom.touchStartX - e.touches[0].clientX) * imageZoom.scale;
    imgWrap.scrollTop = imageZoom.scrollTop + (imageZoom.touchStartY - e.touches[0].clientY) * imageZoom.scale;
    e.preventDefault();
}
