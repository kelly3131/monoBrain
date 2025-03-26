class AudioManager {
    constructor() {
        if (!AudioManager.instance) {
            this.audioElements = {};
            AudioManager.instance = this;

            // ✅ DOM이 아직 로드되지 않았으면 이벤트 대기
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => this.initAudioElements());
            } else {
                this.initAudioElements(); // ✅ DOM이 이미 로드되었으면 즉시 실행
            }
        }
        return AudioManager.instance;
    }

    initAudioElements() {
        // console.log("오디오 요소 생성 시작...");
        if (!document.body) {
            console.error("문서가 아직 로드되지 않음 (document.body 없음)");
            return;
        }

        const audioSources = {
            click: "../../common_contents/common/audio/0-click.mp3",
            correct: "../../common_contents/common/audio/5-drop-o.mp3",
            incorrect: "../../common_contents/common/audio/5-drop-x.wav",
            drag: "../../common_contents/common/audio/tick.mp3",
            drop: "../../common_contents/common/audio/5-drop.mp3",
        };

        Object.keys(audioSources).forEach(key => {
            const audio = document.createElement("audio");
            audio.id = `sound_${key}`;
            audio.src = audioSources[key];
            audio.hidden = true;

            document.body.appendChild(audio);
            this.audioElements[key] = audio;
        });

        // console.log("오디오 요소 생성 완료!");
    }

    playSound(soundId) {
        const audio = this.audioElements[soundId];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(error => console.error(`오디오 재생 오류 (${soundId}):`, error));
        } else {
            console.warn(`"${soundId}" 효과음이 존재하지 않습니다.`);
        }
    }
}

// ✅ 싱글톤 인스턴스 생성
const audioManager = new AudioManager();

/** 각종 효과음 설치 기능 */
// 버튼, .select_options li, 라디오 + label 클릭 시 클릭음 재생
document.body.addEventListener("click", (event) => {
    const excludedClasses = ["on"];
    const target = event.target;

    const isButton = target.tagName === "BUTTON";
    const isSelectOption = target.closest(".select_options li");
    const isRadioLabel = (
        target.tagName === "LABEL" &&
        target.previousElementSibling?.matches("input[type='radio']")
    );

    if (
        (isButton || isSelectOption || isRadioLabel) &&
        !excludedClasses.some(cls => target.classList.contains(cls))
    ) {
        audioManager.playSound("click");
    }
}, true); // 캡처링 단계에서 실행
