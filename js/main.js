/*
  main.js
  ───────
  Everything that isn't playback: building the playlist panel from
  PLAYLIST, opening/closing the letter with a random note from NOTES,
  the floating light particles, and the subtle mouse parallax.
*/

document.addEventListener("DOMContentLoaded", () => {
  Player.init();
  setupPlaylistPanel();
  setupLetter();
  setupParticles();
  setupParallax();
});

/* ---------------------------------------------------------------------- */
/* Playlist panel                                                         */
/* ---------------------------------------------------------------------- */

function setupPlaylistPanel() {
  const panel = document.getElementById("playlistPanel");
  const list = document.getElementById("playlistList");
  const trigger = document.getElementById("playlistTrigger");
  const closeBtn = document.getElementById("playlistClose");
  const scrim = document.getElementById("scrim");

  PLAYLIST.forEach((song, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <button class="playlist-item" data-index="${index}">
        <span class="playlist-item-index">${index + 1}</span>
        <span class="playlist-item-meta">
          <p class="playlist-item-title"></p>
          <p class="playlist-item-artist"></p>
        </span>
      </button>
    `;
    item.querySelector(".playlist-item-title").textContent = song.title;
    item.querySelector(".playlist-item-artist").textContent = song.artist;
    list.appendChild(item);
  });

  function highlightActive(index) {
    list.querySelectorAll(".playlist-item").forEach((btn) => {
      btn.classList.toggle("is-active", Number(btn.dataset.index) === index);
    });
  }

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".playlist-item");
    if (!btn) return;
    Player.playIndex(Number(btn.dataset.index));
    closePanel();
  });

  Player.onTrackChange((index) => highlightActive(index));
  highlightActive(Player.getCurrentIndex());

  function openPanel() {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    scrim.classList.add("is-visible");
    trigger.setAttribute("aria-expanded", "true");
  }

  function closePanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    scrim.classList.remove("is-visible");
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  scrim.addEventListener("click", () => {
    closePanel();
    closeLetterIfOpen();
  });

  window.closePlaylistPanel = closePanel;
}

/* ---------------------------------------------------------------------- */
/* The letter                                                             */
/* ---------------------------------------------------------------------- */

let closeLetterIfOpen = () => {};

function setupLetter() {
  const trigger = document.getElementById("noteTrigger");
  const overlay = document.getElementById("letterOverlay");
  const textEl = document.getElementById("letterText");
  const closeBtn = document.getElementById("letterClose");
  const scene = document.getElementById("scene");

  function renderRandomNote() {
    const note = NOTES[Math.floor(Math.random() * NOTES.length)];
    textEl.innerHTML = "";
    note.forEach((line, i) => {
      const p = document.createElement("p");
      p.textContent = line;
      p.style.animationDelay = `${0.9 + i * 0.28}s`;
      textEl.appendChild(p);
    });
  }

  function open() {
    renderRandomNote();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    scene.classList.add("is-dimmed");
    document.addEventListener("keydown", onKeydown);
  }

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    scene.classList.remove("is-dimmed");
    document.removeEventListener("keydown", onKeydown);
  }

  function onKeydown(e) {
    if (e.key === "Escape") close();
  }

  trigger.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  closeLetterIfOpen = close;
}

/* ---------------------------------------------------------------------- */
/* Floating light particles                                               */
/* ---------------------------------------------------------------------- */

function setupParticles() {
  const container = document.getElementById("particles");
  const count = window.innerWidth < 720 ? 10 : 18;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "particle";

    const size = 3 + Math.random() * 47;
    const startX = Math.random() * 100;
    const startY = 30 + Math.random() * 65;
    const dx = (Math.random() - 0.5) * 120;
    const dy = -(120 + Math.random() * 220);
    const duration = 6 + Math.random() * 1;
    const delay = Math.random() * duration;
    const opacity = 0.25 + Math.random() * 0.10;

    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${startX}%`;
    p.style.top = `${startY}%`;
    p.style.setProperty("--p-dx", `${dx}px`);
    p.style.setProperty("--p-dy", `${dy}px`);
    p.style.setProperty("--p-opacity", opacity);
    p.style.animationDuration = `${duration}s`;
    p.style.animationDelay = `${-delay}s`;

    container.appendChild(p);
  }
}

/* ---------------------------------------------------------------------- */
/* Subtle mouse parallax on the background                                */
/* ---------------------------------------------------------------------- */

function setupParallax() {
  const bg = document.getElementById("bgLayer");
  if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch

  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  const MAX_SHIFT = 20; // px

  window.addEventListener("mousemove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    targetX = -nx * MAX_SHIFT;
    targetY = -ny * MAX_SHIFT;
  });

  function tick() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    bg.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(tick);
  }
  tick();
}
