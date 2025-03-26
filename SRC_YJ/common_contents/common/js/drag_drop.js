// 알아보기 드래그 앤 드랍 기능 변수
const notiDragDrop = {
    draggableItems: [],
    droppableItems: []
};

/** 드래그 앤 드롭 기능을 초기화하는 함수 */
function initializeNotiDragDrop() {
    notiDragDrop.draggableItems = Array.from(document.querySelectorAll(".letKnow .draggable"));
    notiDragDrop.droppableItems = Array.from(document.querySelectorAll(".letKnow .droppable"));
    
    notiDragDrop.droppableItems.forEach(droppable => createScratchMask(droppable));
    notiDragDrop.draggableItems.forEach(draggable => setupDraggable(draggable));
}

/* 드롭 가능한 요소에 스크래치 마스크를 추가하는 함수 */
function createScratchMask(droppable) {
    let dropWidth = droppable.offsetWidth;
    let dropHeight = droppable.offsetHeight;
    let maskId = `scratchMask_${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    let scratchSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    scratchSVG.setAttribute("width", dropWidth);
    scratchSVG.setAttribute("height", dropHeight);
    scratchSVG.innerHTML = `
    <mask id="${maskId}">
    <rect width="100%" height="100%" fill="white"></rect>
    <polyline class="scratch_path" 
    points="833.29 42.74 785.92 60.28 808.73 -5.8 674.22 105.89 705.8 18.18 585.92 114.67 626.27 -13.99 463.99 119.93 499.37 -11.65 428.61 67.3 428.61 28.12 370.71 78.99" 
    ></polyline>
    </mask>
    <rect width="100%" height="100%" mask="url(#${maskId})"></rect>
    `;
    
    droppable.prepend(scratchSVG);
}

/* 드래그 가능한 요소 설정하는 함수 */
function setupDraggable(draggable) {
    let offsetX, offsetY, startX, startY, originalLeft, originalTop;
    let isDragging = false;
    
    draggable.addEventListener("pointerdown", (event) => startDrag(event, draggable));
    window.addEventListener("pointermove", (event) => moveDrag(event, draggable));
    window.addEventListener("pointerup", (event) => endDrag(event, draggable));
}

/** 드래그 시작 시 실행되는 함수 */
function startDrag(event, draggable) {
    audioManager.playSound("drag");
    
    const touch = event.type.includes("touch") ? event.touches[0] : event;
    startX = touch.clientX / globalScale;
    startY = touch.clientY / globalScale;
    originalLeft = draggable.offsetLeft;
    originalTop = draggable.offsetTop;
    offsetX = startX - originalLeft;
    offsetY = startY - originalTop;
    
    draggable.dataset.isDragging = "true";
    event.preventDefault();
}

/** 드래그 중 위치 업데이트 함수 */
function moveDrag(event, draggable) {
    if (draggable.dataset.isDragging !== "true") return;
    
    const touch = event.type.includes("touch") ? event.touches[0] : event;
    let adjustedX = touch.clientX / globalScale;
    let adjustedY = touch.clientY / globalScale;
    let newLeft = adjustedX - offsetX;
    let newTop = adjustedY - offsetY;
    
    draggable.style.left = `${newLeft}px`;
    draggable.style.top = `${newTop}px`;
}

/** 드래그 종료 및 드롭 처리 함수 */
function endDrag(event, draggable) {
    draggable.dataset.isDragging = "false";
    
    let dragPair = draggable.dataset.pair;
    let dropped = false;
    
    notiDragDrop.droppableItems.forEach(dropTarget => {
        if (dropTarget.dataset.pair === dragPair) {
            let dropRect = dropTarget.getBoundingClientRect();
            let dragRect = draggable.getBoundingClientRect();
            
            if (
                dragRect.left < dropRect.right &&
                dragRect.right > dropRect.left &&
                dragRect.top < dropRect.bottom &&
                dragRect.bottom > dropRect.top
            ) {
                audioManager.playSound("drop");
                dropTarget.parentElement.classList.toggle("on");
                dropped = true;
            }
        }
    });
    
    draggable.style.left = "";
    draggable.style.top = "";
    draggable.style.position = "";
    draggable.style.transition = "";
}

/** 알아보기 드래그 앤 드랍 기능 실행 */
initializeNotiDragDrop();