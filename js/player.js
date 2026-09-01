/*
  player.js
  ─────────
  Everything to do with actually playing music: the <audio> element,
  play/pause/next/prev, the seek bar, the volume bar, and time display.
  Also auto-displays lyrics (one line every 3 seconds) if a song has a
  `lyrics` text file linked in PLAYLIST (playlist-data.js).
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
    lyricsDisplay: document.getElementById("lyricsDisplay"),
    lyricsLine: document.getElementById("lyricsLine"),
  };

  let currentIndex = 0;
  let isSeeking = false;
  const listeners = { trackchange: [] };

  // ---- lyrics state ----
  let currentLyricsLines = [];
  let currentLyricIndex = -1;
  const LYRIC_LINE_SECONDS = 3; // universal duration per line

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

    // reset lyrics for the new track
    currentLyricsLines = [];
    currentLyricIndex = -1;
    els.lyricsLine.textContent = "";
    els.lyricsLine.classList.remove("is-visible");

    if (song.lyrics) {
      fetch(song.lyrics)
        .then((res) => res.text())
        .then((text) => {
          currentLyricsLines = text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
        })
        .catch(() => {
          currentLyricsLines = [];
        });
    }

    listeners.trackchange.forEach((fn) => fn(currentIndex, song));

    if (autoplay) {
      audio.play().catch(() => {
        /* autoplay was blocked — that's fine, the UI stays paused */
      });
    }
  }

  function updateLyrics(time) {
    if (!currentLyricsLines.length) return;
    const idx = Math.min(
      Math.floor(time / LYRIC_LINE_SECONDS),
      currentLyricsLines.length - 1
    );
    if (idx === currentLyricIndex) return;
    currentLyricIndex = idx;

    els.lyricsLine.classList.remove("is-visible");
    setTimeout(() => {
      els.lyricsLine.textContent = currentLyricsLines[idx] || "";
      if (currentLyricsLines[idx]) els.lyricsLine.classList.add("is-visible");
    }, 350); // matches CSS fade-out duration
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
      updateLyrics(audio.currentTime);
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
