/** 계산 순서 점 잇기 기능 실행 */
document.querySelectorAll(".drawing_area").forEach(drawingArea => {
    const svg = drawingArea.querySelector(".connection_lines");
    const dotCount = parseInt(drawingArea.dataset.dotCount) || 0;
    let selectedDots = [];
    let connectionCount = 1;
    const bendHeight = 30;
    const offsetY = 20;
    const lineWidth = 2;
    let availableDots = new Map(); // 점을 인덱스 기반으로 관리
    let existingBends = [];
    let labelCount = 1; // ✅ 라벨 번호를 순차적으로 부여하기 위한 변수
    let isInitialized = false; // ✅ 초기화 여부 확인

    function initializeDots() {
        if (isInitialized) return;
        for (let i = 1; i <= dotCount; i++) {
            createDot(i, drawingArea);
        }
        isInitialized = true;
    }
    
    function createDot(label, area, x = null, y = null, isGenerated = false, hideDot = false) {
        const dot = document.createElement("div");
        dot.classList.add("dot", `dot_${label}`);
        dot.dataset.index = label;
        dot.dataset.generated = isGenerated ? "true" : "false";
        if (hideDot) {
            dot.style.visibility = "hidden";
        }
        area.appendChild(dot);

        if (x !== null && y !== null) {
            dot.style.left = `${x}px`;
            dot.style.top = `${y}px`;
        }

        availableDots.set(label, dot);
        dot.addEventListener("click", () => handleDotClick(dot, area, svg));
    }

    function handleDotClick(dot, area, svg, isAuto = false) {
        const index = parseInt(dot.dataset.index);
        if (!availableDots.has(index)) return;
    
        // 자동 클릭 시 선택 해제 로직 무시
        if (!isAuto && selectedDots.includes(dot)) {
            dot.classList.remove("selected");
            selectedDots = selectedDots.filter(d => d !== dot);
            audioManager.playSound('click');
            return;
        }
    
        dot.classList.add("selected");
        selectedDots.push(dot);
    
        if (!isAuto) {
            audioManager.playSound('click');
        }
    
        if (selectedDots.length === 2) {
            createBentLine(selectedDots[0], selectedDots[1], area, svg);
            selectedDots.forEach(d => d.classList.remove("selected"));
            selectedDots = [];
        }
    }
    
    function connectTwoDots(dot1, dot2, area, svg) {
        if (!availableDots.has(parseInt(dot1.dataset.index)) || !availableDots.has(parseInt(dot2.dataset.index))) return;
    
        selectedDots = [dot1, dot2];
        createBentLine(dot1, dot2, area, svg);
        selectedDots = [];
    }
    

    function createBentLine(startDot, endDot, area, svg) {
        const startRect = startDot.getBoundingClientRect();
        const endRect = endDot.getBoundingClientRect();
        const areaRect = area.getBoundingClientRect();
    
        let x1 = (startRect.left + startRect.width / 2 - areaRect.left) / globalScale;
        let y1 = (startRect.top + startRect.height / 2 - areaRect.top) / globalScale;
        let x2 = (endRect.left + endRect.width / 2 - areaRect.left) / globalScale;
        let y2 = (endRect.top + endRect.height / 2 - areaRect.top) / globalScale;
    
        // ✅ 처음에 생성된 점을 `startDot`으로, 이동할 점을 `endDot`으로 보장
        if (startDot.dataset.generated === "true") {
            [startDot, endDot] = [endDot, startDot]; // 스왑
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
        }
    
        let startX = x1;
        let startY = y1;
        let endX = x2;
        let endY = y2;
    
        let lowerY = Math.max(startY, endY);
        let midX = (startX + endX) / 2;
        let midY = lowerY + bendHeight;
        const offsetX = 20; // 좌우 이동 거리
    
        let shouldAdjustX = false;
        // let targetDot = null;
        // let targetLabel = null;
        let targetX = null;
    
        // ✅ X좌표가 10px 오차 범위 내에서 같은 경우 실행
        if (Math.abs(startX - endX) <= 5) {
            // console.log("X축 충돌 감지! 꺾은선 적용");
            shouldAdjustX = true;
        }

        // ✅ 같은 X축에 위치한 점 중에서 **이동해야 할 점을 찾음**
        if (shouldAdjustX) {
            // let targetDrawingArea = startDot.closest(".drawing_area"); // ✅ 해당 점이 속한 태그 찾기

            const targetDot = selectedDots.find(dot => dot.dataset.generated === "true");

            if (targetDot) {
                let targetDrawingArea = targetDot.closest(".drawing_area");
                targetLabels = Array.from(targetDrawingArea.querySelectorAll(".connection_label"))
                    .filter(label => label.dataset.labelIndex === targetDot.dataset.index);
                    
                let moveX = (startX >= endX) ? offsetX : -offsetX;
                let newLeft = parseFloat(targetDot.style.left || "0") + moveX;
                targetDot.style.left = `${newLeft}px`;

                // ✅ 이동된 X 좌표를 `endX`에 반영
                const updatedRect = targetDot.getBoundingClientRect();
                targetX = (updatedRect.left + updatedRect.width / 2 - targetDrawingArea.getBoundingClientRect().left) / globalScale;
                endX = targetX;

                // console.log(`점 이동! X좌표 조정: ${startX} → ${targetX}`);

                // ✅ 해당 점(`targetDot`)과 연결된 라벨만 이동
                targetLabels.forEach(label => {
                    label.style.left = `${newLeft}px`;
                });

                // ✅ 새로운 midX 재계산
                midX = (startX + endX) / 2;
            }
        }

    
        // ✅ 기존보다 더 높은 midY를 유지하면서, 선을 더 꺾음
        let maxExistingY = lowerY;
        existingBends.forEach(bend => {
            if ((bend.startX >= Math.min(startX, endX) && bend.startX <= Math.max(startX, endX)) ||
                (bend.endX >= Math.min(startX, endX) && bend.endX <= Math.max(startX, endX))) {
                maxExistingY = Math.max(maxExistingY, bend.y);
            }
        });
    
        midY = maxExistingY + bendHeight;
        existingBends.push({ startX, endX, y: midY });
    
        // ✅ 이동된 점을 반영하여 **Y축을 먼저 이동한 후, X축으로 이동하는 선을 생성**
        const pathData = `
            M ${startX} ${startY} 
            V ${midY} 
            H ${midX} 
            H ${endX} 
            V ${endY}
        `;
    
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("stroke", "#000");
        path.setAttribute("stroke-width", lineWidth);
        path.setAttribute("fill", "none");
        path.classList.add("connection_line", `line_${connectionCount}`);
        svg.appendChild(path);
    
        let parent1 = parseInt(startDot.dataset.index);
        let parent2 = parseInt(endDot.dataset.index);
        let newLabel = parseInt([...new Set([...parent1.toString(), ...parent2.toString()])].sort((a, b) => a - b).join(''));
    
        availableDots.delete(parent1);
        availableDots.delete(parent2);
        
        const labelIndex = labelCount++

        // ✅ 이동된 점의 위치를 반영하여 새로운 점을 생성
        const connectionLabel = document.createElement("div");
        connectionLabel.classList.add("connection_label", `label_${labelIndex}`);
        connectionLabel.dataset.labelIndex = newLabel; // ✅ dataset.labelIndex 추가
        connectionLabel.textContent = connectionCount;
        connectionLabel.style.position = "absolute";
        connectionLabel.style.left = `${midX}px`;
        connectionLabel.style.top = `${midY + offsetY}px`;
        connectionLabel.style.transform = "translate(-50%, -50%)";
        area.appendChild(connectionLabel);
    
        if (availableDots.size === 0) {
            createDot(newLabel, area, midX, midY + offsetY * 2, true, true);
        } else {
            createDot(newLabel, area, midX, midY + offsetY * 2, true, false);
        }
    
        let userConnections = JSON.parse(svg.dataset.userConnections || "[]");
        userConnections.push([parent1, parent2].sort((a, b) => a - b));
        svg.dataset.userConnections = JSON.stringify(userConnections);
    
        // console.log(svg.dataset.userConnections);
        connectionCount++;
    }

    function resetDrawingArea() {
        console.log("Resetting drawing area");
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        drawingArea.querySelectorAll(".dot").forEach(dot => {
            if (dot.dataset.generated === "true") {
                dot.remove();
            }
        });

        drawingArea.querySelectorAll(".connection_label").forEach(label => label.remove());

        selectedDots = [];
        connectionCount = 1;
        availableDots.clear();
        existingBends = [];
        svg.dataset.userConnections = JSON.stringify([]);
        labelCount = 1;

        drawingArea.querySelectorAll(".dot").forEach(dot => {
            availableDots.set(parseInt(dot.dataset.index), dot);
            dot.removeEventListener("click", handleDotClick);
            dot.addEventListener("click", () => handleDotClick(dot, drawingArea, svg));
        });
    }

    document.addEventListener("pageChanged", () => {
        if (pagenation.activePage.contains(drawingArea)) {
            initializeDots();
        }
    });

    document.querySelectorAll(".btn_area .btnReset").forEach(resetButton => {
        resetButton.addEventListener("click", () => {
            if (pagenation.activePage.contains(drawingArea)) {
                resetDrawingArea();
                isInitialized = false;
                initializeDots();
            }
        });
    });

    document.addEventListener("globalFaultUpdated", (event) => {
        if (event.detail > 1 && pagenation.activePage.contains(drawingArea)) {
            resetDrawingArea();
            initializeDots();
    
            const connectionsData = JSON.parse(drawingArea.dataset.answerConnectline || "[]");
    
            (async () => {
                for (const [dotIndex1, dotIndex2] of connectionsData) {
                    const dot1 = drawingArea.querySelector(`.dot_${dotIndex1}`);
                    const dot2 = drawingArea.querySelector(`.dot_${dotIndex2}`);
                    if (dot1 && dot2) {
                        connectTwoDots(dot1, dot2, drawingArea, svg);
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                }
            })();
        }
    });
    

    initializeDots();
});