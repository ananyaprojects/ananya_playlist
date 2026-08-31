/*
  player.js
  ─────────
  Everything to do with actually playing music: the <audio> element,
  play/pause/next/prev, the seek bar, the volume bar, and time display.
  Reads its songs from PLAYLIST (playlist-data.js).
*/

const Player = (() => {
  const audio = document.getElementById("audioEl");

  const els = {
    playBtn: document.getElementById("playBtn"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    seekBar: document.getElementById("seekBar"),
    volumeBar: document.getElementById("volumeBar"),
    currentTime: document.getElementById("currentTime"),
    duration: document.getElementById("duration"),
    trackTitle: document.getElementById("trackTitle"),
    trackArtist: document.getElementById("trackArtist"),
    iconPlay: document.querySelector(".icon-play"),
    iconPause: document.querySelector(".icon-pause"),
    visualizer: document.getElementById("visualizer"),
    playBtnEl: document.getElementById("playBtn"),
  };

  let currentIndex = 0;
  let isSeeking = false;
  const listeners = { trackchange: [] };

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function loadTrack(index, { autoplay = false } = {}) {
    currentIndex = (index + PLAYLIST.length) % PLAYLIST.length;
    const song = PLAYLIST[currentIndex];

    audio.src = song.src;
    els.trackTitle.textContent = song.title;
    els.trackArtist.textContent = song.artist;
    els.seekBar.value = 0;
    els.currentTime.textContent = "0:00";
    els.duration.textContent = "0:00";

    listeners.trackchange.forEach((fn) => fn(currentIndex, song));

    if (autoplay) {
      audio.play().catch(() => {
        /* autoplay was blocked — that's fine, the UI stays paused */
      });
    }
  }

  function setPlayingUI(playing) {
    els.iconPlay.hidden = playing;
    els.iconPause.hidden = !playing;
    els.playBtnEl.classList.toggle("is-playing", playing);
    els.playBtnEl.setAttribute("aria-label", playing ? "Pause" : "Play");
    els.visualizer.classList.toggle("is-playing", playing);
  }

  function play() {
    audio.play().catch(() => {});
  }

  function pause() {
    audio.pause();
  }

  function togglePlay() {
    if (audio.paused) play();
    else pause();
  }

  function next() {
    loadTrack(currentIndex + 1, { autoplay: !audio.paused || audio.currentTime > 0 });
  }

  function prev() {
    // if we're a few seconds into the song, restart it instead of going back
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    loadTrack(currentIndex - 1, { autoplay: !audio.paused || audio.currentTime > 0 });
  }

  function playIndex(index) {
    loadTrack(index, { autoplay: true });
  }

  function onTrackChange(fn) {
    listeners.trackchange.push(fn);
  }

  function bindEvents() {
    els.playBtn.addEventListener("click", togglePlay);
    els.nextBtn.addEventListener("click", () => next());
    els.prevBtn.addEventListener("click", () => prev());

    audio.addEventListener("play", () => setPlayingUI(true));
    audio.addEventListener("pause", () => setPlayingUI(false));
    audio.addEventListener("ended", () => next());

    audio.addEventListener("loadedmetadata", () => {
      els.seekBar.max = audio.duration || 0;
      els.duration.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (isSeeking) return;
      els.seekBar.value = audio.currentTime;
      els.currentTime.textContent = formatTime(audio.currentTime);
    });

    els.seekBar.addEventListener("input", () => {
      isSeeking = true;
      els.currentTime.textContent = formatTime(Number(els.seekBar.value));
    });
    els.seekBar.addEventListener("change", () => {
      audio.currentTime = Number(els.seekBar.value);
      isSeeking = false;
    });

    els.volumeBar.addEventListener("input", () => {
      audio.volume = Number(els.volumeBar.value);
    });

    audio.volume = Number(els.volumeBar.value);
  }

  function init() {
    bindEvents();
    loadTrack(0);
  }

  return {
    init,
    play,
    pause,
    togglePlay,
    next,
    prev,
    playIndex,
    onTrackChange,
    getCurrentIndex: () => currentIndex,
    formatTime,
  };
})();
