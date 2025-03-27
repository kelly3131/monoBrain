/**
 * 공통 드래그 앤 드롭 기능
 * @param {HTMLElement[]} draggableElements - 드래그 요소 목록
 * @param {HTMLElement[]} droppableElements - 드롭 대상 목록
 * @param {Function} onDropSuccess - 드롭 성공 시 콜백 (draggable, dropTarget)
 * @param {Function} onDropFail - 드롭 실패 시 콜백 (draggable)
 */
function enableDragAndDrop(draggableElements, droppableElements, onDropSuccess, onDropFail) {
    draggableElements
    .filter(Boolean) //null, undefined 제거
    .forEach(draggable => {
        let offsetX, offsetY, startX, startY;

        draggable.addEventListener("pointerdown", (event) => {
            audioManager.playSound("drag");

            const touch = event.type.includes("touch") ? event.touches[0] : event;
            startX = touch.clientX / globalScale;
            startY = touch.clientY / globalScale;
            offsetX = startX - draggable.offsetLeft;
            offsetY = startY - draggable.offsetTop;

            draggable.dataset.isDragging = "true";
            event.preventDefault();
        });

        window.addEventListener("pointermove", (event) => {
            if (draggable.dataset.isDragging !== "true") return;

            const touch = event.type.includes("touch") ? event.touches[0] : event;
            let adjustedX = touch.clientX / globalScale;
            let adjustedY = touch.clientY / globalScale;

            let newLeft = adjustedX - offsetX;
            let newTop = adjustedY - offsetY;

            draggable.style.left = `${newLeft}px`;
            draggable.style.top = `${newTop}px`;
        });

        window.addEventListener("pointerup", (event) => {
            if (draggable.dataset.isDragging !== "true") return;

            draggable.dataset.isDragging = "false";

            let matched = false;
            const dragRect = draggable.getBoundingClientRect();
            const dragPair = draggable.dataset.pair;

            droppableElements.forEach(drop => {
                if (drop.dataset.pair === dragPair) {
                    const dropRect = drop.getBoundingClientRect();
                    const isIntersecting =
                        dragRect.left < dropRect.right &&
                        dragRect.right > dropRect.left &&
                        dragRect.top < dropRect.bottom &&
                        dragRect.bottom > dropRect.top;

                    if (isIntersecting) {
                        matched = true;
                        onDropSuccess?.(draggable, drop);
                    }
                }
            });

            if (!matched) {
                onDropFail?.(draggable);
            }

            draggable.style.left = "";
            draggable.style.top = "";
            draggable.style.position = "";
            draggable.style.transition = "";
        });
    });
}
  
  /** 알아보기 문제용 */
  function initializeNotiDragDrop() {
    const draggables = Array.from(document.querySelectorAll(".letKnow .draggable"));
    const droppables = Array.from(document.querySelectorAll(".letKnow .droppable"));

    droppables.forEach(createScratchMask);

    enableDragAndDrop(
        draggables,
        droppables,
        (drag, drop) => {
            drop.parentElement.classList.toggle("on");
            audioManager.playSound("drop");
        },
        (drag) => {
            // 실패시 추가 동작 가능
        }
    );
}
  
  /** ✅ 마스크 적용 함수 */
  function createScratchMask(droppable) {
    const dropWidth = droppable.offsetWidth;
    const dropHeight = droppable.offsetHeight;
    const maskId = `scratchMask_${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
    const scratchSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    scratchSVG.setAttribute("width", dropWidth);
    scratchSVG.setAttribute("height", dropHeight);
    scratchSVG.innerHTML = `
      <mask id="${maskId}">
        <rect width="100%" height="100%" fill="white" />
        <polyline class="scratch_path" points="833.29 42.74 785.92 60.28 808.73 -5.8 674.22 105.89 705.8 18.18 585.92 114.67 626.27 -13.99 463.99 119.93 499.37 -11.65 428.61 67.3 428.61 28.12 370.71 78.99" />
      </mask>
      <rect width="100%" height="100%" mask="url(#${maskId})" />
    `;
  
    droppable.prepend(scratchSVG);
  }
  
  // 실행
  initializeNotiDragDrop();
  

/**
 * 단일 드래그 요소를 여러 그룹의 드롭 대상에 드롭할 수 있는 기능
 * 그룹당 총 드롭 횟수는 6회로 제한되고, 그룹의 드롭 현황은 data-group-value에 저장됨
 */
function initializeSingleDragMultiDrop() {
    const draggable = document.querySelector(".single_draggable");
    const groups = document.querySelectorAll(".drag_group[data-group-limit]");

    const groupInfos = [];

    groups.forEach(group => {
        const limit = parseInt(group.dataset.groupLimit, 10) || 6;
        const droppables = Array.from(group.querySelectorAll(".droppable"));
        groupInfos.push({ group, limit, droppables });
    });

    const allDroppables = groupInfos.flatMap(info => info.droppables);

    enableDragAndDrop(
        [draggable],
        allDroppables,
        (drag, drop) => {
            const matchedGroupInfo = groupInfos.find(info => info.droppables.includes(drop));
            if (!matchedGroupInfo) return;

            const { group, limit, droppables } = matchedGroupInfo;

            let groupDrops = group.dataset.groupValue
                ? JSON.parse(group.dataset.groupValue)
                : Array(droppables.length).fill(0);

            const index = droppables.indexOf(drop);
            const totalDrops = groupDrops.reduce((a, b) => a + b, 0);

            if (index >= 0 && totalDrops < limit) {
                groupDrops[index] += 1;
                drop.dataset.value = groupDrops[index];
                group.dataset.groupValue = JSON.stringify(groupDrops);
            }else return

            audioManager.playSound("drop");
        },
        (drag) => {
            // 실패 처리
        }
    );
}

initializeSingleDragMultiDrop();
