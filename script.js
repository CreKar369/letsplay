/* ---------------- CONFIG ---------------- */
const MAX_PAGE = 300;          // random page number range (0..300)
const DIGITS = 3;
const BALLS_PER_PLAYER = 10;   // 10-ball match

/* ---------------- ELEMENTS ---------------- */
const cover = document.getElementById('cover');
const startBtn = document.getElementById('startBtn');
const boardWrap = document.getElementById('boardWrap');
const flapRow = document.getElementById('flapRow');
const label = document.getElementById('label');
const kicker = document.getElementById('kicker');
const bowlBtn = document.getElementById('bowlBtn');
const hintText = document.getElementById('hintText');
const winnerBanner = document.getElementById('winnerBanner');
const winnerText = document.getElementById('winnerText');
const resetBtn = document.getElementById('resetBtn');

const p1card = document.getElementById('p1card');
const p2card = document.getElementById('p2card');
const p1score = document.getElementById('p1score');
const p2score = document.getElementById('p2score');
const p1balls = document.getElementById('p1balls');
const p2balls = document.getElementById('p2balls');

/* ---------------- STATE ---------------- */
let state;

function freshState(){
  return {
    turn: 1,           // 1 or 2, whose ball it is
    scores: {1:0, 2:0},
    balls: {1:0, 2:0},
    over: false
  };
}

/* ---------------- FLAP DIGITS ---------------- */
const digitEls = [];
for(let i=0;i<DIGITS;i++){
  const flap = document.createElement('div');
  flap.className = 'flap';
  if(i === DIGITS-1) flap.classList.add('runs-digit'); // last digit = runs
  const digit = document.createElement('div');
  digit.className = 'digit';
  digit.textContent = '0';
  flap.appendChild(digit);
  flapRow.appendChild(flap);
  digitEls.push({flap, digit});
}

function setNumber(n, spinning){
  const str = String(n).padStart(DIGITS, '0');
  digitEls.forEach((el, i) => {
    el.digit.textContent = str[i];
    el.flap.classList.toggle('spin', !!spinning);
  });
}

function runsLabel(runs){
  if(runs === 0) return "DOT BALL";
  if(runs === 4) return "FOUR!";
  if(runs === 6) return "SIX! ✹";
  return runs + " RUN" + (runs === 1 ? "" : "S");
}

/* ---------------- RENDER ---------------- */
function renderState(){
  p1score.textContent = state.scores[1];
  p2score.textContent = state.scores[2];
  p1balls.textContent = state.balls[1] + ' / ' + BALLS_PER_PLAYER + ' balls';
  p2balls.textContent = state.balls[2] + ' / ' + BALLS_PER_PLAYER + ' balls';
  p1card.classList.toggle('active', state.turn === 1 && !state.over);
  p2card.classList.toggle('active', state.turn === 2 && !state.over);
  kicker.textContent = state.over ? 'Match Over' : ("Player " + state.turn + "'s Ball");
}

/* ---------------- TURN LOGIC ---------------- */
function nextTurnAfterBall(justPlayed){
  state.balls[justPlayed]++;
  const bothDone = state.balls[1] >= BALLS_PER_PLAYER && state.balls[2] >= BALLS_PER_PLAYER;
  if(bothDone){
    endMatch();
    return;
  }
  let other = justPlayed === 1 ? 2 : 1;
  if(state.balls[other] >= BALLS_PER_PLAYER){
    state.turn = justPlayed; // other player finished, this player continues
  } else {
    state.turn = other;
  }
}

function endMatch(){
  state.over = true;
  bowlBtn.disabled = true;
  hintText.style.display = 'none';
  let msg;
  if(state.scores[1] > state.scores[2]){
    msg = "PLAYER 1 WINS! " + state.scores[1] + " – " + state.scores[2];
  } else if(state.scores[2] > state.scores[1]){
    msg = "PLAYER 2 WINS! " + state.scores[2] + " – " + state.scores[1];
  } else {
    msg = "IT'S A TIE! " + state.scores[1] + " – " + state.scores[2];
  }
  winnerText.textContent = msg;
  winnerBanner.classList.add('show');
  renderState();
  launchConfetti();
  playCrowdCheer();
}

/* ---------------- BACKGROUND VARIATION (same photo, different look each ball) ---------------- */
const bgLayer = document.getElementById('bgLayer');
const bgFilters = [
  'none',
  'sepia(0.5) saturate(1.3) hue-rotate(-10deg)',
  'grayscale(0.7) contrast(1.1)',
  'hue-rotate(30deg) saturate(1.4)',
  'hue-rotate(-30deg) saturate(1.2) brightness(1.05)',
  'sepia(0.8) contrast(1.15) brightness(0.95)',
  'hue-rotate(160deg) saturate(1.3)',
  'contrast(1.25) saturate(1.5)',
  'grayscale(1) contrast(1.2) brightness(1.1)',
  'hue-rotate(90deg) saturate(1.1)',
  'sepia(0.3) hue-rotate(200deg) saturate(1.2)'
];
let lastBgIndex = -1;

function cycleBackground(){
  let idx;
  do {
    idx = Math.floor(Math.random() * bgFilters.length);
  } while(idx === lastBgIndex && bgFilters.length > 1);
  lastBgIndex = idx;
  bgLayer.style.filter = bgFilters[idx];
}

/* ---------------- BOWLING ---------------- */
let spinTimer = null;

function bowl(){
  if(state.over) return;
  bowlBtn.disabled = true;
  const striker = state.turn;

  cycleBackground();

  let ticks = 0;
  const maxTicks = 14 + Math.floor(Math.random()*6);

  clearInterval(spinTimer);
  spinTimer = setInterval(() => {
    const rand = Math.floor(Math.random() * (MAX_PAGE+1));
    setNumber(rand, true);
    ticks++;
    if(ticks >= maxTicks){
      clearInterval(spinTimer);
      const final = Math.floor(Math.random() * (MAX_PAGE+1));
      setNumber(final, false);
      const runs = final % 10;
      label.textContent = runsLabel(runs) + " — Player " + striker;
      state.scores[striker] += runs;

      nextTurnAfterBall(striker);
      renderState();

      if(!state.over) bowlBtn.disabled = false;
    }
  }, 70);
}

function resetMatch(){
  state = freshState();
  setNumber(0, false);
  label.textContent = "— READY —";
  winnerBanner.classList.remove('show');
  hintText.style.display = '';
  bowlBtn.disabled = false;
  renderState();
}

/* ---------------- BACKGROUND MUSIC (YouTube 90s School Playlist) ---------------- */
const SCHOOL_PLAYLIST = [
  { id: '8caqlSDA7Ew', title: 'Malgudi Days' },
  { id: 'siffHLr7nx8', title: 'School Chale Hum' },
  { id: '7ywioIliNaE', title: 'Mile Sur Mera Tumhara' },
  { id: 'k2n2moB1RlM', title: 'Lakdi Ki Kaathi (Masoom)' },
  { id: 'MIUpZuK9aIQ', title: 'Ek Chidiya Anek Chidiya' },
  { id: 'k9RVgTX55vo', title: 'Jungle Jungle Baat Chali Hai' },
  { id: 'Ux70bUb4tyo', title: 'Shaktimaan Title Song' },
  { id: 'ZV80fZeHvtA', title: 'Chandrakanta Title Song' },
  { id: 'G6IpaVUZYgQ', title: 'Alif Laila Title Song' },
  { id: 'pF8GAGbc2tc', title: 'Surabhi Title Song' }
];

const muteBtn = document.getElementById('muteBtn');
let ytPlayer = null;
let ytReady = false;
let musicMuted = false;
let lastTrackIndex = -1;

function pickRandomTrackIndex(){
  if(SCHOOL_PLAYLIST.length === 1) return 0;
  let idx;
  do {
    idx = Math.floor(Math.random() * SCHOOL_PLAYLIST.length);
  } while(idx === lastTrackIndex);
  return idx;
}

// Called automatically by the YouTube IFrame API once it loads
function onYouTubeIframeAPIReady(){
  const firstIdx = pickRandomTrackIndex();
  lastTrackIndex = firstIdx;
  ytPlayer = new YT.Player('ytPlayer', {
    videoId: SCHOOL_PLAYLIST[firstIdx].id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      playsinline: 1
    },
    events: {
      onReady: () => { ytReady = true; },
      onStateChange: (event) => {
        // ENDED === 0 : move on to another random track from the playlist
        if(event.data === 0){
          const nextIdx = pickRandomTrackIndex();
          lastTrackIndex = nextIdx;
          ytPlayer.loadVideoById(SCHOOL_PLAYLIST[nextIdx].id);
        }
      }
    }
  });
}

function startMusic(){
  if(ytReady && ytPlayer && typeof ytPlayer.playVideo === 'function'){
    ytPlayer.playVideo();
  }
}

muteBtn.addEventListener('click', () => {
  if(!ytPlayer) return;
  musicMuted = !musicMuted;
  if(musicMuted){
    ytPlayer.mute();
    muteBtn.textContent = '🔇';
    muteBtn.classList.add('muted');
  } else {
    ytPlayer.unMute();
    muteBtn.textContent = '🔊';
    muteBtn.classList.remove('muted');
  }
});

/* ---------------- CROWD CHEER + CLAPS (synthesized, no external files) ---------------- */
let cheerCtx = null;

function playCrowdCheer(){
  try{
    if(!cheerCtx){
      cheerCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(cheerCtx.state === 'suspended') cheerCtx.resume();

    const now = cheerCtx.currentTime;

    // ---- claps: short filtered noise bursts, in an applause-like pattern ----
    function clap(time, vol){
      const bufferSize = Math.floor(cheerCtx.sampleRate * 0.06);
      const buffer = cheerCtx.createBuffer(1, bufferSize, cheerCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0;i<bufferSize;i++){
        data[i] = (Math.random()*2-1) * Math.pow(1 - i/bufferSize, 2);
      }
      const noise = cheerCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = cheerCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1200 + Math.random()*800;
      const gain = cheerCtx.createGain();
      gain.gain.setValueAtTime(vol, time);
      noise.connect(filter).connect(gain).connect(cheerCtx.destination);
      noise.start(time);
    }
    // dense applause for ~2.8s
    for(let i=0;i<50;i++){
      clap(now + Math.random()*2.8, 0.35 + Math.random()*0.25);
    }

    // ---- kids shouting "yaaaaa": layered pitch-glide voices ----
    function shout(startTime, baseFreq, duration, vol){
      const osc = cheerCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq*1.5, startTime+duration*0.3);
      osc.frequency.exponentialRampToValueAtTime(baseFreq*0.75, startTime+duration);

      const gain = cheerCtx.createGain();
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(vol, startTime+0.08);
      gain.gain.exponentialRampToValueAtTime(vol*0.6, startTime+duration*0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime+duration);

      const filter = cheerCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = baseFreq*2.2;
      filter.Q.value = 1.8;

      osc.connect(filter).connect(gain).connect(cheerCtx.destination);
      osc.start(startTime);
      osc.stop(startTime+duration+0.05);
    }
    // several "kid" voices at different pitches, slightly staggered = a shouting crowd
    const voicePitches = [280, 340, 300, 370, 260, 400, 320, 355];
    voicePitches.forEach((f, i) => {
      shout(now + i*0.035 + Math.random()*0.02, f, 1.5 + Math.random()*0.5, 0.09 + Math.random()*0.04);
    });

  } catch(e){
    // Web Audio not available — fail silently, confetti still plays
    console.warn('Crowd cheer sound unavailable:', e);
  }
}

/* ---------------- EVENTS ---------------- */
startBtn.addEventListener('click', () => {
  cover.classList.add('open');
  boardWrap.classList.add('show');
  startMusic();
});

bowlBtn.addEventListener('click', bowl);
resetBtn.addEventListener('click', resetMatch);

resetMatch();

/* ---------------- CONFETTI ---------------- */
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');
const confettiColors = ['#cf9d3c', '#f4efdd', '#b5202f', '#4fa3d1', '#d18a4f', '#0b3d2e'];
let confettiPieces = [];
let confettiRunning = false;

function resizeCanvas(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function spawnConfettiPiece(){
  return {
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * 200,
    size: 6 + Math.random() * 6,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 2.5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    shape: Math.random() > 0.5 ? 'rect' : 'circle'
  };
}

function launchConfetti(){
  confettiPieces = [];
  for(let i = 0; i < 160; i++){
    confettiPieces.push(spawnConfettiPiece());
  }
  if(!confettiRunning){
    confettiRunning = true;
    requestAnimationFrame(updateConfetti);
  }
  // stop spawning new bursts after 3s, let existing pieces fall off screen
  setTimeout(() => { confettiPieces.forEach(p => p.done = true); }, 3200);
}

function updateConfetti(){
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach(p => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.fillStyle = p.color;
    if(p.shape === 'rect'){
      ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 40);

  if(confettiPieces.length > 0){
    requestAnimationFrame(updateConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}
