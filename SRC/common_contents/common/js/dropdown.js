// 커스텀 드롭다운 박스 기능 변수
const customDropdown = {
    dropdowns: [],
};

/** 커스텀 드롭다운 초기화 */
function initializeCustomDropdowns() {
    customDropdown.dropdowns = document.querySelectorAll(".custom_dropdown"); // ✅ 모든 드롭다운 가져오기
    
    customDropdown.dropdowns.forEach(select => {
        select.style.display = "none"; // 기존 select 숨기기

        // 컨테이너 생성
        const customSelect = document.createElement("div");
        customSelect.classList.add("custom_select");
        if(select.classList.contains("math_symbol")){
            customSelect.classList.add("math_symbol");
        }

        // 트리거 버튼 생성
        const trigger = document.createElement("button");
        trigger.classList.add("select_trigger", "default");
        trigger.innerHTML = `${select.options[select.selectedIndex]?.text || "선택"} <span class="arrow"></span>`;

        // 옵션 리스트 생성
        const optionsList = document.createElement("ul");
        optionsList.classList.add("select_options", "scrollable");

        // 옵션 추가
        Array.from(select.options).forEach(option => {
            if (option.value) {
                const li = document.createElement("li");
                li.textContent = option.value;
                li.dataset.value = option.value;
                li.addEventListener("click", () => handleSelectOption(select, trigger, optionsList, option));
                optionsList.appendChild(li);
            }
        });

        // 클릭 이벤트 (드롭다운 열기/닫기)
        trigger.addEventListener("click", () => toggleDropdown(optionsList, trigger));

        // 외부 클릭 시 닫기
        document.addEventListener("click", (e) => closeDropdownOnClickOutside(e, customSelect, optionsList, trigger));

        // 요소 추가
        customSelect.appendChild(trigger);
        customSelect.appendChild(optionsList);
        select.parentNode.insertBefore(customSelect, select.nextSibling);

        // 데이터 속성 추가 (초기 상태 저장)
        select.dataset.initialValue = select.value;
        // trigger.dataset.initialText = trigger.innerHTML;
    });

    // 리셋 버튼 이벤트 추가
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("btnReset")) {
            resetCustomDropdowns();
        }
    });
}

/** 옵션 선택 처리 */
function handleSelectOption(select, trigger, optionsList, option) {
    select.value = option.value; // ✅ 원본 select 값 변경
    trigger.innerHTML = `${option.value} <span class="arrow"></span>`;
    trigger.classList.remove("default", "error");
    trigger.classList.add("completion");

    // ✅ 기존 `selected` 클래스 제거
    optionsList.querySelectorAll("li").forEach(li => li.classList.remove("selected"));

    // ✅ 선택된 옵션에 `selected` 클래스 추가
    const selectedLi = Array.from(optionsList.children).find(li => li.dataset.value === option.value);
    if (selectedLi) {
        selectedLi.classList.add("selected");
    }

    // ✅ 기존 <option>에서 selected 제거 후, 새로 선택된 값 반영
    Array.from(select.options).forEach(opt => opt.selected = false); // 모든 선택 해제
    const selectedOption = select.querySelector(`option[value="${option.value}"]`);
    if (selectedOption) {
        selectedOption.selected = true; // ✅ 새로 선택한 옵션만 선택
    }

    optionsList.style.display = "none";
    trigger.classList.remove("active");

    // ✅ 강제 change 이벤트 발생 (일부 브라우저에서 필요)
    select.dispatchEvent(new Event("change"));

    trigger.dataset.selNum = selectedOption.index + 1;
    trigger.dataset.value = selectedOption.value;
}

/** 드롭다운 열기/닫기 토글 */
function toggleDropdown(optionsList, trigger) {
    optionsList.style.display = optionsList.style.display === "block" ? "none" : "block";
    trigger.classList.toggle("active");

    const targetBox = trigger.getBoundingClientRect();
    const view = document.getElementById("app_wrap")

    if(targetBox.top / globalScale > view.clientHeight / 2){
        optionsList.classList.add("upper")
    }else{
        optionsList.classList.remove("upper")
    }
}

/** 외부 클릭 시 드롭다운 닫기 */
function closeDropdownOnClickOutside(event, customSelect, optionsList, trigger) {
    const excludedSelectors = [".dynamic-scrollbar", ".dynamic-scrollbar-thumb"]; // 🔹 제외할 요소들
    const isExcluded = excludedSelectors.some(selector => event.target.closest(selector));

    if (!customSelect.contains(event.target) && !isExcluded) {
        optionsList.style.display = "none";
        trigger.classList.remove("active");
    }
}


/** 모든 커스텀 드롭다운 리셋 */
function resetCustomDropdowns() {
    const dropdowns = pagenation.activePage.querySelectorAll(".custom_dropdown"); // ✅ 현재 페이지 내의 select들만 선택

    dropdowns.forEach(select => {
        select.value = ""; // ✅ 기본 선택값 제거

        // ✅ 모든 option에서 selected 제거
        Array.from(select.options).forEach(opt => opt.selected = false);

        // ✅ 해당 select의 바로 다음에 생성된 .custom_select 찾기
        const customSelect = select.nextElementSibling;
        if (!customSelect || !customSelect.classList.contains("custom_select")) return; // 존재하지 않으면 리턴

        const trigger = customSelect.querySelector(".select_trigger");
        const optionsList = customSelect.querySelector(".select_options");

        if (trigger) {
            trigger.innerHTML = `선택 <span class="arrow"></span>`; // 기본값으로 변경
            trigger.classList.remove("completion", "error");
            trigger.classList.add("default");

            // ✅ 트리거의 data-* 속성 초기화
            trigger.removeAttribute("data-sel-num");
            trigger.removeAttribute("data-value");
        }

        // ✅ 모든 `li` 태그에서 selected 클래스 제거
        if (optionsList) {
            optionsList.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
        }

        // ✅ select의 data-initial-value 속성 제거
        select.removeAttribute("data-initial-value");

        // ✅ change 이벤트 강제 발생 (폼 리셋을 위해 필요)
        select.dispatchEvent(new Event("change"));
    });
}


/** 커스텀 드롭다운 박스 기능 실행 */
initializeCustomDropdowns();