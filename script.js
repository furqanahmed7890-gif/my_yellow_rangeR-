const videoScreen = document.getElementById("videoScreen");
const mainScreen = document.getElementById("mainScreen");

const memeVideo = document.getElementById("memeVideo");
const startBtn = document.getElementById("startBtn");
const skipBtn = document.getElementById("skipBtn");
const soundBtn = document.getElementById("soundBtn");

const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const buttons = document.getElementById("buttons");
const reveal = document.getElementById("reveal");
const smsLink = document.getElementById("smsLink");

let yesScale = 1;

// ---------- Helpers ----------
function showMain() {
  videoScreen.hidden = true;
  mainScreen.hidden = false;

  // Try to start music (allowed because user already tapped Start/Skip)
  tryPlayMusic();
}

async function tryPlayMusic() {
  try {
    await bgm.play();
    if (musicBtn) musicBtn.textContent = "Pause song";
  } catch {
    // If blocked, user can press the pause/play button later
    if (musicBtn) musicBtn.textContent = "Play song";
  }
}

// ---------- Video flow ----------
async function startExperience(playWithSound = true) {
  // Try to play video
  try {
    memeVideo.muted = !playWithSound; // unmuted attempt
    memeVideo.playsInline = true;

    await memeVideo.play();

    // Show sound toggle once video is playing
    soundBtn.hidden = false;
    soundBtn.textContent = memeVideo.muted ? "Unmute" : "Mute";
  } catch {
    // If unmuted play fails, fallback to muted autoplay
    try {
      memeVideo.muted = true;
      await memeVideo.play();
      soundBtn.hidden = false;
      soundBtn.textContent = "Unmute";
    } catch {
      // If video can't play at all, go straight to main
      showMain();
    }
  }
}

startBtn.addEventListener("click", async () => {
  // Start video after a user gesture (best chance to allow sound)
  await startExperience(true);
});

skipBtn.addEventListener("click", () => {
  // Stop video if playing
  try { memeVideo.pause(); } catch {}
  showMain();
});

memeVideo.addEventListener("ended", () => {
  showMain();
});

soundBtn.addEventListener("click", async () => {
  memeVideo.muted = !memeVideo.muted;
  soundBtn.textContent = memeVideo.muted ? "Unmute" : "Mute";
});

// ---------- Valentine buttons ----------
function moveNoButton() {
  const rect = buttons.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = rect.width - btnRect.width;
  const maxY = rect.height - btnRect.height;

  const x = Math.max(0, Math.random() * maxX);
  const y = Math.max(0, Math.random() * maxY);

  noBtn.style.position = "absolute";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

function growYes() {
  yesScale = Math.min(2.4, yesScale + 0.16);
  yesBtn.style.transform = `scale(${yesScale})`;
}

noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
  growYes();
});
noBtn.addEventListener("mouseenter", () => {
  moveNoButton();
  growYes();
});

yesBtn.addEventListener("click", async () => {
  reveal.hidden = false;

  // Set SMS link
  const msg = encodeURIComponent("YES. Sultan Restaurant (Agawam) on Feb 14? ❤️");
  smsLink.href = `sms:?&body=${msg}`;

  // Confetti + ensure music
  await tryPlayMusic();
  startConfetti(2200);

  reveal.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

if (musicBtn) {
  musicBtn.addEventListener("click", async () => {
    try {
      if (bgm.paused) {
        await bgm.play();
        musicBtn.textContent = "Pause song";
      } else {
        bgm.pause();
        musicBtn.textContent = "Play song";
      }
    } catch {
      musicBtn.textContent = "Tap again";
    }
  });
}

// ---------- Confetti ----------
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let confettiPieces = [];
let confettiTimer = null;

function rand(min, max) { return Math.random() * (max - min) + min; }

function startConfetti(durationMs = 2000) {
  confettiPieces = Array.from({ length: 200 }).map(() => ({
    x: rand(0, window.innerWidth),
    y: rand(-50, window.innerHeight),
    r: rand(2, 6),
    vx: rand(-1.4, 1.4),
    vy: rand(2.3, 5.6),
    rot: rand(0, Math.PI),
    vrot: rand(-0.12, 0.12),
    color: ["#ff3d9a", "#ff7cc9", "#ffd27d", "#b388ff", "#7c5cff"][Math.floor(rand(0, 5))]
  }));

  const start = performance.now();

  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;

      if (p.y > window.innerHeight + 20) p.y = -10;
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r * 2.2, p.r * 2.2);
      ctx.restore();
    });

    if (elapsed < durationMs) confettiTimer = requestAnimationFrame(frame);
    else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiPieces = [];
    }
  }

  if (confettiTimer) cancelAnimationFrame(confettiTimer);
  confettiTimer = requestAnimationFrame(frame);
}
