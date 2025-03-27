/** 정오답 체크 및 힌트 기능 실행 */
// 모든 버튼 요소를 가져와 이벤트 리스너 추가
document.querySelectorAll(".btn_area button").forEach(button => {
    const btn = document.querySelectorAll(".paging_controller button");

    button.addEventListener("click", () => {
        // 버튼의 클래스를 확인하여 기능 실행
        if (button.classList.contains("btnType")) {
            if(!penModeProxy.isPenMode){
                penModeProxy.isPenMode = true;
            }else{
                penModeProxy.isPenMode = false;
            }
        } else if (button.classList.contains("btnReset")) {
            globalFaultCount = 0;
            showExampleFields(button);
            resetInputFields();
            resetRevealSystem();
            resetBooleanBtn();
            resetBooleanCount();
            resetDragGroupValue();
            resetSelfCheckRadioGroups();
            
            btn.forEach(btn => {
                btn.removeAttribute("disabled");
            });
            
            typeof resetCustom === "function" && resetCustom();
        } else if (button.classList.contains("btnCheck")) {
            if(button.classList.contains("close")) {
                resetRevealSystem()
                return;
            }
            revealAllAnswers();
            checkAnswers(onCorrect, onIncorrect, onIncorrectTwice, onEmpty);
        } else if (button.classList.contains("btnSample")) {
            showExampleFields();
            button.classList.contains("close") ? restoreBooleanCountSelection() : applyBooleanCountSimplified();
        }
    });
});

/****************************************************************************************************************/
/** input, textarea, select, drawline의 정오답 체크 및 힌트 기능 */
function checkAnswers(onCorrect, onIncorrect, onIncorrectTwice, onEmpty) {
    // 정답 비교 대상 셀렉터 목록 (확장 가능)
    const correctionSelectors = [
        ".input_wrap input[data-answer-single]",
        ".input_wrap textarea[data-answer-single]",
        ".custom_dropdown[data-answer-single]",
        ".drawing_area[data-answer-connectline]",
        ".boolean_wrap button[data-answer-single]",
        ".boolean_count_wrap[data-answer-single]",
        ".drag_share .drag_group[data-answer-single]",
    ];

    const targets = pagenation.activePage.querySelectorAll(correctionSelectors.join(","));

    let incorrectOccurred = false;
    let emptyOccurred = false;

    if (targets.length === 0) return;

    targets.forEach(el => {
        const correction = el.dataset.correction;

        if (correction === "false") {
            incorrectOccurred = true;
        } else if (correction !== "true") {
            emptyOccurred = true;
        }
    });

    // console.log(emptyOccurred, incorrectOccurred)
    if (emptyOccurred) {
        onEmpty();
        return;
    }

    if (incorrectOccurred) {
        updateGlobalFaultCount(globalFaultCount + 1);
        if (globalFaultCount > 1) {
            onIncorrectTwice();
        } else {
            onIncorrect();
        }
        audioManager.playSound("incorrect");
    } else {
        onCorrect();
        globalFaultCount = 0;
        audioManager.playSound("correct");
    }
}

// 계산 순서 점 잇기 정답 비교 함수 (배열이 동일한지 검사)
function compareConnectionArrays(correct, user) {
    if (correct.length !== user.length) return false;

    // 배열을 문자열로 변환하여 정렬 후 비교 (순서 무관 비교)
    const sortedCorrect = correct.map(pair => JSON.stringify(pair.sort((a, b) => a - b))).sort();
    const sortedUser = user.map(pair => JSON.stringify(pair.sort((a, b) => a - b))).sort();

    return JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser);
}

// 정답 처리 콜백
function onCorrect() {
    typeof onCorrectCustom === "function" && onCorrectCustom();
    pagenation.activePage.querySelectorAll(".input_wrap, .dropdown_wrap, .drawing_area").forEach(wrapper => wrapper.classList.remove("hint")); // 모든 hint 제거
    toastCheckMsg("정답이에요!", 4, false);
}

// 첫 번째 오답 처리 콜백
function onIncorrect() {
    typeof onIncorrectCustom === "function" && onIncorrectCustom();
    toastCheckMsg("한 번 더 생각해 보세요.", 2, false);
}

// 두 번째 이상 오답 처리 콜백
function onIncorrectTwice() {
    typeof onIncorrectTwiceCustom === "function" && onIncorrectTwiceCustom();
    const page = pagenation.activePage;
    const btn = document.querySelectorAll(".btn_area button:not(.btnReset), .paging_controller button")

    btn.forEach(btn => {
        if(btn && btn.classList.contains("active")){
            btn.classList.remove("active")
        }else{
            btn.setAttribute("disabled", true);
        }
    })

    // input_wrap, dropdown_wrap, drawing_area 처리
    page.querySelectorAll(".input_wrap, .dropdown_wrap, .drawing_area").forEach(wrapper => {
        const isDrawingArea = wrapper.classList.contains("drawing_area");

        if (isDrawingArea) {
            if (wrapper.dataset.correction === "false") {
                wrapper.classList.add("hint");
            }
        } else {
            const inner = wrapper.querySelector("input, textarea, select.custom_dropdown, .connection_lines");
            if (inner?.dataset.correction === "false") {
                wrapper.classList.add("hint");
            }
        }
    });

    // ✅ boolean 버튼 처리
    page.querySelectorAll(".boolean_wrap > button").forEach(button => {
        const isTrueAnswer = button.dataset.answerSingle === "true";

        if (isTrueAnswer) {
            button.classList.add("hint");
        }
    });

    page.querySelector(".boolean_count_wrap") ? applyBooleanCountSimplified() : null

    // ✅ drag_group 정답 힌트 처리
    page.querySelectorAll(".drag_group[data-answer-single]").forEach(group => {
        let answerArray;
        try {
            answerArray = JSON.parse(group.dataset.answerSingle || "[]");
        } catch {
            answerArray = [];
        }

        const droppables = group.querySelectorAll(".droppable");

        answerArray.forEach((val, i) => {
            if (droppables[i]) {
                droppables[i].dataset.value = val;
            }
        });


    });

    toastCheckMsg("정답을 확인해 보세요.", 3, false);
}

// 빈 값 처리 콜백
function onEmpty() {
    typeof onEmptyCustom === "function" && onEmptyCustom();
    toastCheckMsg("문제를 풀어보세요!", 1, false);
}

function resetInputFields() {
    pagenation.activePage.querySelectorAll(".input_wrap input, .input_wrap textarea, .custom_dropdown").forEach(element => {
        if (element.tagName === "SELECT") {
            element.selectedIndex = 0; // 첫 번째 선택값으로 초기화
        } else {
            element.value = ""; // 입력 필드 값 초기화
        }
        element.parentElement.classList.remove("hint"); // 부모 태그에서 hint 클래스 제거
        resetRevealSystem
    });
    
    pagenation.activePage.querySelectorAll(".drawing_area").forEach(element => {
        element.classList.remove("hint");
    })
}

function showExampleFields(trigger){
    if(trigger && trigger.classList.contains("btnReset")){
        pagenation.activePage.querySelectorAll(".example_box").forEach(element => { 
            element.classList.remove("on");
        });
    }else{
        pagenation.activePage.querySelectorAll(".example_box").forEach(element => { 
            element.classList.toggle("on");
        });
    } 
}

/****************************************************************************************************************/
/** 개별 버튼 클릭 시 숨김 답안 공개 (순서 제한 제거) */
document.addEventListener("click", (event) => {
    if (pagenation.activePage && pagenation.activePage.contains(event.target) && event.target.classList.contains("reveal_btn")) {
        const button = event.target;
        button.classList.toggle("on");

        // data-pair 값 가져오기
        const pairValue = button.dataset.pair;
        if (pairValue) {
            // 같은 data-pair 값을 가진 hidden_obj 요소에 on 클래스 추가/제거
            pagenation.activePage.querySelectorAll(`.hidden_obj[data-pair='${pairValue}']`).forEach(hidden => {
                hidden.classList.toggle("on");
            });
        }
    }
});

/** 전체 답안 공개 */
function revealAllAnswers() {
    pagenation.activePage.querySelectorAll(".reveal_btn").forEach(hidden => hidden.classList.add("on"));
    pagenation.activePage.querySelectorAll(".hidden_obj").forEach(hidden => hidden.classList.add("on"));
}

/** 모든 답안 숨기기 (초기화) */
function resetRevealSystem() {
    pagenation.activePage.querySelectorAll(".reveal_btn").forEach(hidden => hidden.classList.remove("on"));
    pagenation.activePage.querySelectorAll(".hidden_obj").forEach(hidden => hidden.classList.remove("on"));
}

/****************************************************************************************************************/
/**
 * 활성 페이지 내부 요소들 중 조건을 만족하면 콜백 실행
 * 각 rule은 { selector, test(el) } 형식
 * @param {Array} rules - 검사할 규칙 배열
 * @param {Function} callback - 하나라도 만족하면 실행
 * @param {Function} callbackNot - 전부 불만족이면 실행
 */
function watchWithCustomTest(rules, callback, callbackNot) {
    let lastMatchedKeys = new Set();

    const evaluate = () => {
        if (!pagenation.activePage) return;

        const matchedNow = new Set();

        rules.forEach(({ selector, test, key }) => {
            const elements = pagenation.activePage.querySelectorAll(selector);
            const isMatched = Array.from(elements).some(el => test(el));
            if (isMatched) matchedNow.add(key || selector);
        });

        // 🔍 변경 감지
        const added = [...matchedNow].filter(k => !lastMatchedKeys.has(k));
        const removed = [...lastMatchedKeys].filter(k => !matchedNow.has(k));

        const changed = added.length > 0 || removed.length > 0;

        if (changed) {
            lastMatchedKeys = matchedNow;

            if (matchedNow.size > 0) {
                callback([...matchedNow]); // 여전히 만족하는 전체 목록
            }

            if (removed.length > 0) {
                callbackNot(removed, matchedNow.size <= 0); // 사라진 조건만 전달
            }
        }
    };

    document.addEventListener("click", evaluate);
    document.addEventListener("keyup", evaluate);
    document.addEventListener("input", evaluate);
    document.addEventListener("change", evaluate);

    evaluate();
}

/**
 * 공통 버튼 활성화 조건 감시
 * 정오답 체크시
 */
watchWithCustomTest([
    {
        selector: ".input_wrap input, .custom_dropdown",
        test: el => el.value.trim() !== ""
    },
    {
        selector: ".reveal_btn",
        test: el => el.classList.contains("on") == true
    },
    {
        selector: ".connection_lines",
        test: el => {
            try {
                const arr = JSON.parse(el.dataset.userConnections || "[]");
                return Array.isArray(arr) && arr.length > 0;
            } catch (e) {
                return false;
            }
        }
    },
    {
        key: "textarea_with_example",
        selector: ".input_wrap textarea",
        test: el => {
            const filled = el.value.trim() !== "";
            const hasExample = !!el.closest(".input_wrap")?.querySelector(".example_box");
            return filled && hasExample;
        }
    },
    {
        key: "textarea_without_example",
        selector: ".input_wrap textarea",
        test: el => {
            const filled = el.value.trim() !== "";
            const noExample = !el.closest(".input_wrap")?.querySelector(".example_box");
            return filled && noExample;
        }
    },
    {
        selector: ".boolean_wrap button",
        test: el => el.classList.contains("selected") === true
    },
    {
        selector: ".boolean_count_wrap button",
        test: el => el.classList.contains("selected") === true
    },
    {
        selector: ".drag_share .drag_group",
        test: el => el.dataset.groupValue !== undefined
    },
    {
        selector: ".self_check .state_wrap",
        test: group => {
          return group.querySelector("input[type='radio']:checked") !== null;
        }
    }
], (selector) => {
    const activeBtn = document.querySelectorAll(".btn_area button:not(.btnType, .btnSample)");
    if(activeBtn) activeBtn.forEach(btn => btn.classList.add('active'));

    if (
        selector.includes("textarea_with_example") ||
        selector.some(key => key.includes(".boolean_count_wrap"))
    ) {
        document.querySelector(".btn_area .btnSample")?.classList.add("active");
    }
},(removedSelector, isEmpty)=>{
    const activeBtn = document.querySelectorAll(".btn_area button:not(.btnType, .btnSample)")
    const closeBtn = document.querySelector(".btn_area button.close");
    const exampleBox = document.querySelectorAll(".example_box");
    const booleanCountBox = document.querySelectorAll(".boolean_count_wrap button")

    if(activeBtn && isEmpty) activeBtn.forEach(btn => btn.classList.remove('active'));
    if (
        removedSelector.includes("textarea_with_example") ||
        removedSelector.some(key => key.includes(".boolean_count_wrap"))
    ) {
        document.querySelector(".btn_area .btnSample")?.classList.remove("active");
        if(closeBtn && isEmpty)  closeBtn.classList.remove('close');
        if(exampleBox && isEmpty) exampleBox.forEach(box => box.classList.remove('on'));
    }
    if ( removedSelector.some(key => key.includes(".boolean_count_wrap")) ) resetBooleanCount();

});

/**
 * 공통 버튼 활성화 조건 감시
 * 샘플보기 및 숨김버튼 기능의 체크 버튼
 */
watchWithCustomTest([
    {
        selector: ".example_box",
        test: el => el.classList.contains("on") == true
    },
    {
        selector: ".reveal_btn",
        test: el => el.classList.contains("on") == true
    },
    {
        selector: ".boolean_count_wrap",
        test: el => el.hasAttribute("data-prev-selected")
    },
], (selector) => {
    const btn = document.querySelector(".btn_area .btnSample");
    if (btn) btn.classList.add("close");
    if(selector === ".reveal_btn"){
        const checkBtn = document.querySelector(".btn_area .btnCheck");
        if (checkBtn) checkBtn.classList.add("close");
    }
},(removedSelector, isEmpty)=>{
    const btn = document.querySelector(".btn_area .btnSample");
    const checkBtn = document.querySelector(".btn_area .btnCheck");
    if (btn) btn.classList.remove("close");
    if (checkBtn) checkBtn.classList.remove("close");
});


/**
 * submit 버튼 클릭 시 조건 평가 후 토스트 표시
 * @param {string} buttonSelector - 제출 버튼 셀렉터
 * @param {Array} rules - 검사할 요소 규칙 (selector + test)
 */
function validateBeforeSubmit(buttonSelector, rules) {
    document.addEventListener("click", (e) => {
        const submitBtn = document.querySelector(buttonSelector);
        if (!submitBtn || e.target !== submitBtn) return;

        if (!pagenation.activePage) return;

        let hasEmpty = false;
        let isSelfCheckMissing = false;

        rules.forEach(({ selector, test }) => {
            const elements = pagenation.activePage.querySelectorAll(selector);
            const failed = Array.from(elements).some(el => !test(el));
            if (failed) {
                hasEmpty = true;
                if (selector.includes(".self_check")) {
                    isSelfCheckMissing = true;
                }
            }
        });

        pagenation.activePage.querySelectorAll(".example_box").forEach(el => {
            el.classList.add("on");
        });

        if (hasEmpty) {
            if (isSelfCheckMissing) {
                toastCheckMsg("자기 점검 항목을 선택해주세요.", 5);
            } else {
                toastCheckMsg("아직 풀지 못한 문제가 있어요.<br/>이대로 제출할까요?", 5, true);
            }
        } else {
            toastCheckMsg("이대로 제출할까요?", 5, true);
        }
    });
}

validateBeforeSubmit(".btnSubmit", [
    {
        selector: ".input_wrap input, .input_wrap textarea, .custom_dropdown",
        test: el => el.value.trim() !== ""
    },
    {
        selector: ".custom_dropdown",
        test: el => el.dataset.selected !== undefined && el.dataset.selected !== ""
    },
    {
        selector: ".self_check .state_wrap",
        test: group => {
          return group.querySelector("input[type='radio']:checked") !== null;
        }
    },
]);

/**
 * 요소의 입력값과 정답을 비교하여 data-correction 갱신
 * @param {Array} configs - 각 항목은 { selector, getValue, getAnswer, onUpdate? }
 */
function bindAnswerCheck(configs) {
    const updateCorrection = (el, getValue, getAnswer, onUpdate) => {
        const userValue = getValue(el);
        const answerValue = getAnswer(el);
    
        const isEmptyInput =
            userValue === undefined ||
            userValue === null ||
            (typeof userValue === "string" && userValue.trim() === "") ||
            (Array.isArray(userValue) && userValue.length === 0);
    
        // ✅ empty_answer는 무조건 우선 처리
        if (answerValue === "empty_answer") {
            const isCorrect = isEmptyInput;
            el.dataset.correction = isCorrect ? "true" : "false";
            if (onUpdate) onUpdate(el, isCorrect);
            return;
        }
    
        // ✅ 사용자 입력이 없으면 correction 제거
        if (isEmptyInput) {
            delete el.dataset.correction;
            return;
        }
    
        // ✅ 일반 비교
        const isCorrect = userValue === answerValue;
        el.dataset.correction = isCorrect ? "true" : "false";
        if (onUpdate) onUpdate(el, isCorrect);
    };

    configs.forEach(({ selector, getValue, getAnswer, onUpdate }) => {
        const handler = (e) => {
            const target = e.target.closest(selector);
            if (target) updateCorrection(target, getValue, getAnswer, onUpdate);
        };

        document.addEventListener("input", handler);
        document.addEventListener("change", handler);
        document.addEventListener("keyup", handler);

        // 초기 상태도 검사
        document.querySelectorAll(selector).forEach(el => {
            updateCorrection(el, getValue, getAnswer, onUpdate);
        });
    });
}

/**
 * 특정 셀렉터에 대해 지정한 attribute 변화 감지 시 콜백 실행
 * @param {string} selector - 대상 요소 셀렉터
 * @param {string} attributeName - 감지할 attribute 이름
 * @param {Function} callback - 변화 발생 시 실행할 함수 (triggerElement 전달됨)
 */
function observeAttributeChange(selector, attributeName, callback) {
    const observers = [];

    document.querySelectorAll(selector).forEach(target => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === "attributes" && mutation.attributeName === attributeName) {
                    callback(mutation.target);
                }
            });
        });

        observer.observe(target, {
            attributes: true,
            attributeFilter: [attributeName]
        });

        observers.push(observer);
    });

    return observers; // 옵저버 배열 리턴 (원할 때 disconnect 가능)
}

bindAnswerCheck([
    {
        selector: ".input_wrap input",
        getValue: el => el.value.trim(),
        getAnswer: el => el.dataset.answerSingle?.trim()
    },
    {
        selector: ".input_wrap textarea",
        getValue: el => el.value.trim(),
        getAnswer: el => el.dataset.answerSingle?.trim()
    },
    {
        selector: ".custom_dropdown",
        getValue: el => el.parentElement.querySelector(".select_trigger")?.dataset.value || "",
        getAnswer: el => el.dataset.answerSingle,
    },
    {
        selector: ".drawing_area",
        getValue: el => {
          const user = el.querySelector("svg")?.dataset.userConnections;
          try {
            return JSON.stringify(JSON.parse(user || "[]"));
          } catch (e) {
            return "";
          }
        },
        getAnswer: el => {
          try {
            return JSON.stringify(JSON.parse(el.dataset.answerConnectline || "[]"));
          } catch (e) {
            return "";
          }
        }
    },
    {
        selector: ".boolean_wrap button",
        getValue: el => el.classList.contains("selected") ? "true" : "false",
        getAnswer: el => el.dataset.answerSingle
    },
    {
        selector: ".boolean_count_wrap",
        getValue: el => {
          return el.querySelectorAll("button.selected").length;
        },
        getAnswer: el => parseInt(el.dataset.answerSingle, 10),
      },
      {
        selector: ".drag_share .drag_group",
        getValue: (el) => {
          try {
            return JSON.parse(el.dataset.groupValue || "[]");
          } catch {
            return [];
          }
        },
        getAnswer: (el) => {
          try {
            return JSON.parse(el.dataset.answerSingle || "[]");
          } catch {
            return [];
          }
        },
      },
]);

// 드롭다운 상태 변경 감지
observeAttributeChange(".select_trigger", "data-value", (trigger) => {
    const select = trigger.closest(".dropdown_wrap")?.querySelector(".custom_dropdown");
    if (!select) return;

    const userValue = trigger.dataset.value;
    const answerValue = select.dataset.answerSingle;
    const isCorrect = userValue === answerValue;

    select.dataset.correction = isCorrect ? "true" : "false";
});

// 점선 연결 그리기 상태 변경 감지
observeAttributeChange(".drawing_area .connection_lines", "data-user-connections", (svg) => {
    const area = svg.closest(".drawing_area");
    if (!area) return;

    // ⬇️ 로컬 정규화 함수
    const normalizeConnections = (jsonStr) => {
        try {
            const arr = JSON.parse(jsonStr || "[]");
            return JSON.stringify(
                arr.map(pair => pair.sort((a, b) => a - b))
                   .sort((a, b) => a[0] - b[0] || a[1] - b[1])
            );
        } catch (e) {
            return "[]";
        }
    };

    const userValue = normalizeConnections(svg.dataset.userConnections);
    const answerValue = normalizeConnections(area.dataset.answerConnectline);
    const isCorrect = userValue === answerValue;

    area.dataset.correction = isCorrect ? "true" : "false";
    area.classList.toggle("correct", isCorrect);
    area.classList.toggle("incorrect", !isCorrect);
});

// boolean 버튼 상태 변경 감지
observeAttributeChange(".boolean_wrap button", "class", (button) => {
    const userValue = button.classList.contains("selected") ? "true" : "false";
    const answerValue = button.dataset.answerSingle;
    const isCorrect = userValue === answerValue;

    button.dataset.correction = isCorrect ? "true" : "false";
});

observeAttributeChange(".boolean_count_wrap button", "class", (button) => {
    const wrapper = button.closest(".boolean_count_wrap");
    if (!wrapper) return;

    const selectedCount = wrapper.querySelectorAll("button.selected").length;
    const correctCount = parseInt(wrapper.dataset.answerSingle, 10);
    const isCorrect = selectedCount === correctCount;

    wrapper.dataset.correction = isCorrect ? "true" : "false";
});

// dragndrop limit 기능에서 드래그 그룹 값 변화 감지
observeAttributeChange(".drag_share .drag_group", "data-group-value", (groupEl) => {
    const groupValue = groupEl.dataset.groupValue;
    const answerValue = groupEl.dataset.answerSingle;

    let userArray = [];
    let answerArray = [];

    try {
        userArray = JSON.parse(groupValue || "[]");
        answerArray = JSON.parse(answerValue || "[]");
    } catch (e) {
        console.warn("JSON 파싱 오류:", e);
    }

    const isCorrect = (() => {
        if (!Array.isArray(userArray) || !Array.isArray(answerArray)) return false;
        if (userArray.length !== answerArray.length) return false;

        const sortedUser = [...userArray].sort();
        const sortedAnswer = [...answerArray].sort();

        return sortedUser.every((v, i) => v === sortedAnswer[i]);
    })();

    groupEl.dataset.correction = isCorrect ? "true" : "false";
});

/**
 * boolean 체크 선택 기능
 * 칸 선택 수 체크 기능
 */
document.querySelectorAll(".boolean_wrap > button").forEach(button => {
    button.addEventListener("click", () => {
        // 현재 활성 페이지의 모든 버튼에서 "hint" 클래스 제거
        pagenation.activePage.querySelectorAll(".boolean_wrap > button").forEach(btn => {
            btn.classList.remove("hint");
        });

        // 클릭한 버튼의 "selected" 클래스 토글
        button.classList.toggle("selected");
    });
});

function resetBooleanBtn() {
    // 현재 활성 페이지의 모든 버튼에서 "hint" 클래스 제거
    document.querySelectorAll(".boolean_wrap > button").forEach(button => {
        button.classList.remove("hint");
    });

    // 현재 활성 페이지의 모든 버튼에서 "selected" 클래스 제거
    document.querySelectorAll(".boolean_wrap > button").forEach(button => {
        button.classList.remove("selected");
    });
}
/** 칸 선택 수 체크 기능 */
document.querySelectorAll(".boolean_count_wrap > button").forEach(button => {
    button.addEventListener("click", () => {
        // 현재 활성 페이지의 모든 버튼에서 "hint" 클래스 제거
        pagenation.activePage.querySelectorAll(".boolean_wrap > button").forEach(btn => {
            btn.classList.remove("hint");
        });

        // 클릭한 버튼의 "selected" 클래스 토글
        button.classList.toggle("selected");
    });
});

function resetBooleanCount() {
    pagenation.activePage.querySelectorAll(".boolean_count_wrap").forEach(wrapper => {
        wrapper.querySelectorAll("button").forEach(btn => btn.classList.remove("selected"));
        wrapper.dataset.correction = "false";

        delete wrapper.dataset.prevSelected;
    });
}

function resetDragGroupValue() {
    pagenation.activePage.querySelectorAll(".drag_share .drag_group").forEach(group => {
        // 그룹의 드롭 상태 초기화
        delete group.dataset.groupValue;

        // 그룹 내 드롭 요소 초기화 (선택사항)
        group.querySelectorAll(".droppable").forEach(drop => {
            delete drop.dataset.value;
        });
    });
}


function applyBooleanCountSimplified() {
    pagenation.activePage.querySelectorAll(".boolean_count_wrap").forEach(wrapper => {
        const allButtons = Array.from(wrapper.querySelectorAll("button"));

        // 현재 선택 상태 저장
        const selectedIndexes = allButtons
            .map((btn, index) => btn.classList.contains("selected") ? index : -1)
            .filter(i => i !== -1);

        wrapper.dataset.prevSelected = JSON.stringify(selectedIndexes);

        // 기존 selected 모두 제거
        allButtons.forEach(btn => btn.classList.remove("selected"));

        // 정답 수만큼만 앞에서부터 selected 부여
        const count = parseInt(wrapper.dataset.answerSingle, 10);
        for (let i = 0; i < count && i < allButtons.length; i++) {
            allButtons[i].classList.add("selected");
        }
    });
}

function restoreBooleanCountSelection() {
    pagenation.activePage.querySelectorAll(".boolean_count_wrap").forEach(wrapper => {
        const allButtons = Array.from(wrapper.querySelectorAll("button"));

        // 복원할 인덱스 불러오기
        const selectedIndexes = JSON.parse(wrapper.dataset.prevSelected || "[]");

        // 전체 초기화
        allButtons.forEach(btn => btn.classList.remove("selected"));

        // 이전 선택 상태 복원
        selectedIndexes.forEach(index => {
            if (allButtons[index]) {
                allButtons[index].classList.add("selected");
            }
        });

        // 저장 상태 제거 (선택사항)
        delete wrapper.dataset.prevSelected;
    });
}

/****************************************************************************************************************/
/** 셀프체크 */
function resetSelfCheckRadioGroups() {
    pagenation.activePage.querySelectorAll(".self_check .state_wrap").forEach(group => {
        // 그룹 내 선택된 라디오 버튼을 찾아 체크 해제
        group.querySelectorAll("input[type='radio']").forEach(radio => {
            radio.checked = false;
        });
    });
}