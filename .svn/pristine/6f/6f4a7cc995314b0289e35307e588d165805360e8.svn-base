const handler = {
    set(target, key, value) {
        if (key === "isPenMode") {
            if (value === true) {
                onPenModeActivated();
            } else {
                onPenModeDeactivated();
            }
        }
        target[key] = value;
        return true;
    }
};

const penModeProxy = new Proxy(penModeState, handler);

// 실행 예제
function onPenModeActivated() {
    // console.log("🖊️ 펜 모드 활성화");
    document.querySelectorAll(".input_wrap").forEach(element => {
        element.classList.add('pen_mode')
    });
    document.querySelectorAll(".btn_area .btnType").forEach(element => {
        element.classList.add('pen')
    });
}

function onPenModeDeactivated() {
    // console.log("❌ 펜 모드 비활성화");
    document.querySelectorAll(".input_wrap").forEach(element => {
        element.classList.remove('pen_mode')
    });
    document.querySelectorAll(".btn_area .btnType").forEach(element => {
        element.classList.remove('pen')
    });
}