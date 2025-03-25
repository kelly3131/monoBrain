// 비디오 플레이어 UI 동작 관련 기능 변수
const videoPlayer = {
    element: null,
    playBtn: null,
    volumeBtn: null,
    volumeController: null,
    muteBtn: null,
    volumeSlider: null,
    isMute: false,
    videoVolume: 0,
};

/** 비디오 플레이어 초기화 */
function initializeVideoPlayer() {
    videoPlayer.element = document.querySelector(".video_player_wrap");
    if (!videoPlayer.element) return; // 비디오 플레이어가 없으면 종료

    videoPlayer.playBtn = videoPlayer.element.querySelector(".play");
    videoPlayer.volumeBtn = videoPlayer.element.querySelector(".volume");
    videoPlayer.volumeController = videoPlayer.element.querySelector(".volume_controller_wrap");
    videoPlayer.muteBtn = videoPlayer.element.querySelector(".mute");
    videoPlayer.volumeSlider = videoPlayer.volumeController ? videoPlayer.volumeController.querySelector("input[type='range']") : null;

    if (videoPlayer.volumeBtn && videoPlayer.volumeController) {
        videoPlayer.volumeBtn.addEventListener("click", toggleVolumeController);
    }

    if (videoPlayer.playBtn) {
        videoPlayer.playBtn.addEventListener("click", togglePlayPause);
    }

    if (videoPlayer.muteBtn && videoPlayer.volumeSlider) {
        videoPlayer.muteBtn.addEventListener("click", toggleMute);
    }
}

/** 프로그레스바 초기화 및 업데이트 */
function initializeProgressBar() {
    const seekbar = document.querySelector(".seekbar input[type='range']");
    const seekgague = document.querySelector(".seekbar .gague");
    
    if (seekbar && seekgague) {
        function updateSeekbarGague() {
            const percent = (seekbar.value - seekbar.min) / (seekbar.max - seekbar.min) * 100;
            seekgague.style.width = `${percent}%`;
        }

        seekbar.addEventListener("input", updateSeekbarGague);
        updateSeekbarGague(); // 초기 값 설정
    }
    
    const volumebar = document.querySelector(".volumebar input[type='range']");
    const volumegague = document.querySelector(".volumebar .gague");
    
    if (volumebar && volumegague) {
        function updateVolumebarGague() {
            const percent = (volumebar.value - volumebar.min) / (volumebar.max - volumebar.min) * 100;
            volumegague.style.width = `${percent}%`;
        }

        volumebar.addEventListener("input", updateVolumebarGague);
        updateVolumebarGague(); // 초기 값 설정

        // updateVolumebarGague를 전역에서 접근 가능하게 설정
        window.updateVolumebarGague = updateVolumebarGague;
    }
}

/** 볼륨 컨트롤러 표시 토글 */
function toggleVolumeController() {
    videoPlayer.volumeController.style.display = (videoPlayer.volumeController.style.display === "block") ? "none" : "block";
}

/** 재생/일시정지 토글 */
function togglePlayPause() {
    videoPlayer.playBtn.classList.toggle('pause');
}

/** 음소거 토글 */
function toggleMute() {
    videoPlayer.muteBtn.classList.toggle('on');
    if (!videoPlayer.isMute) {
        videoPlayer.videoVolume = videoPlayer.volumeSlider.value; // 현재 볼륨 저장
        videoPlayer.volumeSlider.value = 0;
    } else {
        videoPlayer.volumeSlider.value = videoPlayer.videoVolume; // 기존 볼륨 복원
    }
    videoPlayer.isMute = !videoPlayer.isMute;

    // 볼륨 게이지 업데이트
    if (typeof window.updateVolumebarGague === "function") {
        window.updateVolumebarGague();
    }
}

/** 비디오 플레이어 UI 동작 기능 실행 */
initializeVideoPlayer();
initializeProgressBar();