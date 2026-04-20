/* ═══════════════════════════════════════════════════════════
   game.js — Bubble Pop Blast! – Core game engine
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── State machine constants ────────────────────────────────
const STATE = Object.freeze({
  LOADING:  'LOADING',
  MENU:     'MENU',
  SHOP:     'SHOP',
  HOWTO:    'HOWTO',
  GAME:     'GAME',
  PAUSE:    'PAUSE',
  WIN:      'WIN',
  GAMEOVER: 'GAMEOVER',
  LEADERBOARD: 'LEADERBOARD',
});

// ── Grid helpers ───────────────────────────────────────────
const R   = CFG.BUBBLE_R;
const DIA = R * 2;
const ROW_H = R * Math.sqrt(3);  // vertical spacing between row centres

function colX(row, col) {
  const offset = (row % 2 === 1) ? R : 0; // even rows (0-idx) no offset; odd rows shift right
  return R + col * DIA + offset;
}

function rowY(row) {
  return CFG.GRID_TOP_Y + R + row * ROW_H;
}

function colsInRow(row) {
  return (row % 2 === 0) ? CFG.COLS_ODD : CFG.COLS_EVEN;
}

// Hexagonal neighbours (row, col)
function neighbours(row, col) {
  const isOdd = row % 2 === 1;
  return [
    [row - 1, col + (isOdd ? 0 : -1)],
    [row - 1, col + (isOdd ? 1 :  0)],
    [row,     col - 1],
    [row,     col + 1],
    [row + 1, col + (isOdd ? 0 : -1)],
    [row + 1, col + (isOdd ? 1 :  0)],
  ];
}

// ── Bubble class ───────────────────────────────────────────
class Bubble {
  constructor(colorIdx, special = SPECIAL.NONE) {
    this.color   = colorIdx;   // integer index into COLORS, or -1 for special
    this.special = special;    // SPECIAL.BOMB | SPECIAL.RAINBOW | SPECIAL.NONE
    this.falling = false;
    this.fallVY  = 0;
    this.x = 0; this.y = 0;   // pixel position (used while falling)
    this.alpha   = 1;
    this.scale   = 1;
    this.popAnim = 0;          // 0 = normal, >0 = popping animation timer
  }
}

// ── Main game object ───────────────────────────────────────
const Game = (() => {

  // ── DOM refs ──────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const canvas    = $('game-canvas');
  const nextCanvas = $('next-canvas');
  const ctx       = canvas.getContext('2d');
  const nextCtx   = nextCanvas.getContext('2d');

  // ── State variables ───────────────────────────────────────
  let state       = STATE.LOADING;
  let grid        = [];          // grid[row][col] = Bubble | null
  let gridRows    = 0;

  let shooterAngle = -Math.PI / 2; // radians, default straight up
  let currentBubble = null;        // bubble being aimed / shot
  let nextBubble    = null;        // next bubble queued

  let flying = null;               // { bub, x, y, vx, vy } — airborne bubble

  let score     = 0;
  let coins     = 0;
  let lives     = CFG.MAX_LIVES;
  let level     = 1;
  let shotsThisDescend = 0;
  let comboCount = 0;

  let activePowerup   = null;   // 'bomb' | 'rainbow' | 'freeze' | null
  let freezeActive    = false;
  let freezeTimer     = 0;

  let fallingBubbles  = [];     // [{bub, x, y, vy, alpha}]
  let popParticles    = [];     // [{x, y, vx, vy, color, life}]
  let scorePopups     = [];     // [{x, y, val, life}]
  let coinPopups      = [];     // DOM elements

  let canvasW, canvasH;
  let shooterX, shooterY;
  let dangerY;

  let animId = null;
  let lastTime = 0;

  let levelColors = [];          // colour indices active this level
  let levelData   = null;

  // pointer state
  let pointerDown = false;
  let aimX = 0, aimY = 0;

  // ── Initialise canvas size ────────────────────────────────
  function resizeCanvas() {
    const maxW = Math.min(window.innerWidth,  CFG.CANVAS_W);
    const maxH = Math.min(window.innerHeight - 90, CFG.CANVAS_H);
    const scale = Math.min(maxW / CFG.CANVAS_W, maxH / CFG.CANVAS_H);
    canvasW = CFG.CANVAS_W;
    canvasH = CFG.CANVAS_H;
    canvas.width  = canvasW;
    canvas.height = canvasH;
    canvas.style.width  = Math.round(CFG.CANVAS_W * scale) + 'px';
    canvas.style.height = Math.round(CFG.CANVAS_H * scale) + 'px';
    shooterX = canvasW / 2;
    shooterY = Math.round(canvasH * CFG.SHOOTER_Y_RATIO);
    dangerY  = rowY(CFG.DANGER_ROW);
  }

  // ── Screen management ─────────────────────────────────────
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active', 'visible');
    });
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add(el.classList.contains('overlay') ? 'visible' : 'active');
  }

  function showOverlay(name) {
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('visible');
  }

  function hideOverlay(name) {
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.remove('visible');
  }

  // ── Loading sequence ──────────────────────────────────────
  function doLoading() {
    const bar  = $('loading-bar');
    const text = $('loading-text');
    const steps = ['Spawning bubbles…', 'Mixing colours…', 'Loading cannon…', 'Ready!'];
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 18 + 8;
      if (pct >= 100) { pct = 100; clearInterval(iv); }
      bar.style.width = pct + '%';
      const idx = Math.floor((pct / 100) * steps.length);
      text.textContent = steps[Math.min(idx, steps.length - 1)];
      if (pct >= 100) setTimeout(goMenu, 300);
    }, 120);
  }

  function goMenu() {
    state = STATE.MENU;
    updateMenuStats();
    showScreen('menu');
    spawnMenuBubbles();
    if (Storage.data.soundOn) Audio.startMusic();
  }

  // ── Menu animated background bubbles ─────────────────────
  function spawnMenuBubbles() {
    const container = $('menu-bubbles');
    container.innerHTML = '';
    for (let i = 0; i < 14; i++) {
      const div = document.createElement('div');
      const size = 30 + Math.random() * 70;
      div.className = 'fb';
      div.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        animation-duration:${4 + Math.random() * 6}s;
        animation-delay:${Math.random() * -8}s;
      `;
      container.appendChild(div);
    }
  }

  function updateMenuStats() {
    $('menu-highscore').textContent = Storage.data.highscore || 0;
    $('menu-coins').textContent     = Storage.data.coins     || 0;
    $('menu-level').textContent     = Storage.data.level     || 1;
  }

  // ── Start level ───────────────────────────────────────────
  function startLevel(lvl) {
    level     = Math.max(1, Math.min(lvl, LEVELS.length));
    levelData = LEVELS[level - 1];
    levelColors = levelData.colors.slice();

    score     = 0;
    coins     = Storage.data.coins;
    lives     = CFG.MAX_LIVES;
    shotsThisDescend  = 0;
    comboCount        = 0;
    activePowerup     = null;
    freezeActive      = false;
    freezeTimer       = 0;
    fallingBubbles    = [];
    popParticles      = [];
    scorePopups       = [];
    flying            = null;

    buildGrid();

    currentBubble = newBubble();
    nextBubble    = newBubble();

    state = STATE.GAME;
    updateHUD();
    updateNextBubble();
    updatePowerupBar();
    showScreen('game');
    clearPowerupSelection();
  }

  function newBubble(forceSpecial) {
    if (forceSpecial) return new Bubble(-1, forceSpecial);
    const idx = levelColors[Math.floor(Math.random() * levelColors.length)];
    return new Bubble(idx);
  }

  // ── Build grid from level data ────────────────────────────
  function buildGrid() {
    grid = [];
    const rows = levelData.rows;
    gridRows = rows.length;

    for (let r = 0; r < rows.length; r++) {
      grid[r] = [];
      const rowData = rows[r];
      const maxCols = colsInRow(r);
      for (let c = 0; c < maxCols; c++) {
        const val = (rowData && rowData[c] !== undefined) ? rowData[c] : null;
        grid[r][c] = (val !== null && val !== undefined) ? new Bubble(val) : null;
      }
    }
  }

  // ── Check if grid is cleared ──────────────────────────────
  function isGridEmpty() {
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) return false;
      }
    }
    return true;
  }

  // ── HUD helpers ───────────────────────────────────────────
  function updateHUD() {
    $('hud-score').textContent = score;
    $('hud-coins').textContent = coins;
    $('hud-level').textContent = level;
    const hearts = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, CFG.MAX_LIVES - lives));
    $('hud-lives').textContent = hearts;
  }

  function updateNextBubble() {
    const nc = nextCtx;
    nc.clearRect(0, 0, 36, 36);
    if (nextBubble) {
      drawSingleBubble(nc, 18, 18, 14, nextBubble);
    }
  }

  function updatePowerupBar() {
    const inv = Storage.getInventory();
    $('pu-bomb').textContent    = inv.bomb;
    $('pu-rainbow').textContent = inv.rainbow;
    $('pu-freeze').textContent  = inv.freeze;
    $('pu-life').textContent    = inv.life;

    ['bomb','rainbow','freeze','life'].forEach(item => {
      const btn = $('btn-use-' + item);
      btn.disabled = (inv[item] <= 0);
    });
  }

  function clearPowerupSelection() {
    activePowerup = null;
    document.querySelectorAll('.btn-powerup').forEach(b => b.classList.remove('active'));
  }

  // ── Shooting ──────────────────────────────────────────────
  function shoot() {
    if (flying || state !== STATE.GAME) return;

    const angle = shooterAngle;
    // Prevent shooting downward
    if (angle > -0.15 && angle < Math.PI + 0.15) {
      if (Math.sin(angle) > 0) return;
    }

    let bub;
    if (activePowerup === 'bomb') {
      if (!Storage.useItem('bomb')) return;
      bub = newBubble(SPECIAL.BOMB);
      clearPowerupSelection();
    } else if (activePowerup === 'rainbow') {
      if (!Storage.useItem('rainbow')) return;
      bub = newBubble(SPECIAL.RAINBOW);
      clearPowerupSelection();
    } else {
      bub = currentBubble;
    }

    updatePowerupBar();
    Audio.sfx.shoot();

    const speed = CFG.BUBBLE_SPEED;
    flying = {
      bub,
      x:  shooterX,
      y:  shooterY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };

    currentBubble = nextBubble;
    nextBubble    = newBubble();
    updateNextBubble();

    shotsThisDescend++;
    if (shotsThisDescend >= CFG.SHOTS_PER_DESCENT && !freezeActive) {
      shotsThisDescend = 0;
      descendGrid();
    }
  }

  // ── Descend grid ──────────────────────────────────────────
  function descendGrid() {
    // Add a new row at top, push existing rows down
    const newRow = [];
    const maxCols = colsInRow(0); // new row always goes in as row 0 → all rows shift
    for (let c = 0; c < maxCols; c++) {
      const idx = levelColors[Math.floor(Math.random() * levelColors.length)];
      newRow[c] = new Bubble(idx);
    }
    grid.unshift(newRow);
    gridRows++;
    // Check danger row
    checkDanger();
  }

  function checkDanger() {
    const dr = CFG.DANGER_ROW;
    if (grid[dr]) {
      for (let c = 0; c < colsInRow(dr); c++) {
        if (grid[dr][c]) {
          loseLife();
          return;
        }
      }
    }
  }

  function loseLife() {
    Audio.sfx.loseLife();
    lives--;
    updateHUD();
    // Shake canvas wrapper
    const wrapper = document.querySelector('.canvas-wrapper');
    wrapper.classList.add('danger-flash');
    setTimeout(() => wrapper.classList.remove('danger-flash'), 400);

    if (lives <= 0) {
      endGame(false);
    }
  }

  // ── Physics update ────────────────────────────────────────
  function updateFlying(dt) {
    if (!flying) return;

    flying.x += flying.vx * dt;
    flying.y += flying.vy * dt;

    // Wall bounce
    if (flying.x - R < 0) {
      flying.x = R;
      flying.vx = Math.abs(flying.vx);
    }
    if (flying.x + R > canvasW) {
      flying.x = canvasW - R;
      flying.vx = -Math.abs(flying.vx);
    }

    // Hit top wall
    if (flying.y - R <= 0) {
      flying.y = R;
      landBubble(flying, 0);
      return;
    }

    // Collision with grid
    const hit = gridCollision(flying.x, flying.y);
    if (hit) {
      landBubble(flying, hit);
      return;
    }

    // Went too low (missed everything)
    if (flying.y > canvasH + R) {
      flying = null;
    }
  }

  function gridCollision(bx, by) {
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      const cols = colsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c]) continue;
        const gx = colX(r, c);
        const gy = rowY(r);
        const dx = bx - gx, dy = by - gy;
        if (dx * dx + dy * dy < (DIA * 0.9) * (DIA * 0.9)) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  function landBubble(fly, hit) {
    const { bub, x, y } = fly;
    flying = null;

    // Find best empty cell near landing point
    const { row, col } = findNearestEmpty(x, y, hit);

    if (row === -1) {
      // No room — just ignore (shouldn't happen often)
      return;
    }

    // Ensure grid has enough rows
    while (grid.length <= row) grid.push([]);
    while (!grid[row]) grid[row] = [];
    const cols = colsInRow(row);
    if (!grid[row].length) {
      for (let c = 0; c < cols; c++) grid[row][c] = null;
    }

    // Handle bomb
    if (bub.special === SPECIAL.BOMB) {
      triggerBomb(row, col);
      return;
    }

    grid[row][col] = bub;

    // Find match group
    const group = (bub.special === SPECIAL.RAINBOW)
      ? findLargestColorGroup(row, col)
      : findMatchGroup(row, col, bub.color);

    if (group.length >= CFG.MATCH_MIN) {
      popGroup(group);
    } else {
      // Check if new grid height causes danger
      checkDanger();
    }
  }

  function findNearestEmpty(bx, by, hit) {
    // Try cells adjacent to hit, or the top row if hit is ceiling
    const candidates = [];

    // Also consider the hit row itself if it's a ceiling hit (hit===0)
    if (hit === 0) {
      const r = 0;
      for (let c = 0; c < colsInRow(r); c++) {
        if (!grid[r] || !grid[r][c]) candidates.push({ row: r, col: c });
      }
    } else {
      const { row: hr, col: hc } = hit;
      const nbrs = neighbours(hr, hc);
      nbrs.push([hr, hc]); // also the hit cell itself if empty somehow
      nbrs.forEach(([nr, nc]) => {
        if (nr < 0) return;
        const cols = colsInRow(nr);
        if (nc < 0 || nc >= cols) return;
        const cellEmpty = !grid[nr] || !grid[nr][nc];
        if (cellEmpty) candidates.push({ row: nr, col: nc });
      });
    }

    // Pick closest to landing point
    let best = { row: -1, col: -1, dist: Infinity };
    candidates.forEach(({ row, col }) => {
      const cx = colX(row, col);
      const cy = rowY(row);
      const d  = (bx - cx) ** 2 + (by - cy) ** 2;
      if (d < best.dist) best = { row, col, dist: d };
    });

    return best;
  }

  // ── BFS: find connected same-colour group ─────────────────
  function findMatchGroup(startRow, startCol, color) {
    const group = [];
    const visited = new Set();

    function visit(r, c) {
      const key = `${r},${c}`;
      if (visited.has(key)) return;
      if (r < 0 || r >= grid.length) return;
      if (!grid[r] || !grid[r][c]) return;
      const bub = grid[r][c];
      if (bub.color !== color && bub.special !== SPECIAL.RAINBOW) return;
      visited.add(key);
      group.push({ row: r, col: c });
      neighbours(r, c).forEach(([nr, nc]) => visit(nr, nc));
    }

    visit(startRow, startCol);
    return group;
  }

  // For rainbow: find the largest existing colour group touching (startRow,startCol)
  function findLargestColorGroup(startRow, startCol) {
    const colorCounts = {};
    neighbours(startRow, startCol).forEach(([nr, nc]) => {
      if (nr < 0 || nr >= grid.length || !grid[nr] || !grid[nr][nc]) return;
      const col = grid[nr][nc].color;
      if (col >= 0) colorCounts[col] = (colorCounts[col] || 0) + 1;
    });
    let bestColor = -1, bestCount = 0;
    Object.entries(colorCounts).forEach(([c, cnt]) => {
      if (cnt > bestCount) { bestColor = +c; bestCount = cnt; }
    });

    if (bestColor === -1) return [{ row: startRow, col: startCol }];

    // Set rainbow cell's colour to match
    grid[startRow][startCol].color   = bestColor;
    grid[startRow][startCol].special = SPECIAL.NONE;
    return findMatchGroup(startRow, startCol, bestColor);
  }

  // ── Pop a group of bubbles ─────────────────────────────────
  function popGroup(group) {
    comboCount++;
    const pts = group.length * CFG.POP_SCORE * comboCount;
    score += pts;

    group.forEach(({ row, col }) => {
      const bub = grid[row][col];
      if (!bub) return;
      const px = colX(row, col);
      const py = rowY(row);
      spawnPopParticles(px, py, bub.color >= 0 ? COLORS[bub.color] : '#fff');
      spawnScorePopup(px, py, CFG.POP_SCORE);
      grid[row][col] = null;
    });

    // Earn coins
    const coinsEarned = group.length * CFG.COIN_PER_POP * comboCount;
    coins += coinsEarned;
    Storage.addCoins(coinsEarned);
    Audio.sfx.coin();
    Audio.sfx.pop(comboCount);

    if (comboCount >= 3) Audio.sfx.combo(comboCount);

    // Find floating bubbles
    const floating = findFloating();
    if (floating.length > 0) {
      launchFalling(floating);
      const dropPts = floating.length * CFG.DROP_SCORE;
      score += dropPts;
      const dropCoins = Math.floor(floating.length * 0.5);
      coins += dropCoins;
      Storage.addCoins(dropCoins);
      Audio.sfx.drop();
    }

    updateHUD();

    // Check win
    if (isGridEmpty()) {
      setTimeout(() => endGame(true), 600);
    }
  }

  // ── Bomb power-up ─────────────────────────────────────────
  function triggerBomb(row, col) {
    Audio.sfx.powerup();
    const group = [{ row, col }];
    neighbours(row, col).forEach(([nr, nc]) => {
      if (nr < 0 || nr >= grid.length || !grid[nr] || !grid[nr][nc]) return;
      group.push({ row: nr, col: nc });
    });
    if (group.length >= 1) popGroup(group);
  }

  // ── Find floating (disconnected) bubbles ──────────────────
  function findFloating() {
    const connected = new Set();

    // BFS from top row
    function bfsTop(r, c) {
      const key = `${r},${c}`;
      if (connected.has(key)) return;
      if (r < 0 || r >= grid.length || !grid[r] || !grid[r][c]) return;
      connected.add(key);
      neighbours(r, c).forEach(([nr, nc]) => bfsTop(nr, nc));
    }

    for (let c = 0; c < colsInRow(0); c++) {
      if (grid[0] && grid[0][c]) bfsTop(0, c);
    }

    const floating = [];
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      for (let c = 0; c < colsInRow(r); c++) {
        if (grid[r][c] && !connected.has(`${r},${c}`)) {
          floating.push({ row: r, col: c });
        }
      }
    }
    return floating;
  }

  function launchFalling(floaters) {
    floaters.forEach(({ row, col }) => {
      const bub = grid[row][col];
      if (!bub) return;
      const fx = colX(row, col);
      const fy = rowY(row);
      fallingBubbles.push({
        color: bub.color >= 0 ? COLORS[bub.color] : '#fff',
        x: fx, y: fy,
        vx: (Math.random() - 0.5) * 120,
        vy: 80 + Math.random() * 80,
        alpha: 1,
        scale: 1,
      });
      grid[row][col] = null;
    });
  }

  function updateFalling(dt) {
    for (let i = fallingBubbles.length - 1; i >= 0; i--) {
      const f = fallingBubbles[i];
      f.y  += f.vy * dt;
      f.x  += f.vx * dt;
      f.vy += 400 * dt; // gravity
      f.alpha -= dt * 2;
      f.scale  = Math.max(0, f.alpha);
      if (f.alpha <= 0 || f.y > canvasH + 40) fallingBubbles.splice(i, 1);
    }
  }

  // ── Particles ─────────────────────────────────────────────
  function spawnPopParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 80 + Math.random() * 120;
      popParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.6 + Math.random() * 0.3,
        r: 3 + Math.random() * 4,
      });
    }
  }

  function updateParticles(dt) {
    for (let i = popParticles.length - 1; i >= 0; i--) {
      const p = popParticles[i];
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
      if (p.life <= 0) popParticles.splice(i, 1);
    }
  }

  function spawnScorePopup(x, y, val) {
    scorePopups.push({ x, y, val: '+' + val, life: 0.8, vy: -60 });
  }

  function updateScorePopups(dt) {
    for (let i = scorePopups.length - 1; i >= 0; i--) {
      const p = scorePopups[i];
      p.y   += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) scorePopups.splice(i, 1);
    }
  }

  // ── Freeze power-up ───────────────────────────────────────
  function activateFreeze() {
    if (!Storage.useItem('freeze')) return;
    Audio.sfx.freeze();
    freezeActive = true;
    freezeTimer  = 10;  // seconds
    updatePowerupBar();
    clearPowerupSelection();

    const el = document.createElement('div');
    el.className = 'freeze-overlay';
    el.id = 'freeze-overlay';
    document.body.appendChild(el);
  }

  function updateFreeze(dt) {
    if (!freezeActive) return;
    freezeTimer -= dt;
    if (freezeTimer <= 0) {
      freezeActive = false;
      const el = $('freeze-overlay');
      if (el) el.remove();
    }
  }

  // ── Game end ──────────────────────────────────────────────
  function endGame(won) {
    if (state === STATE.WIN || state === STATE.GAMEOVER) return;

    Storage.setHighscore(score);
    Storage.addTopScore(score);

    if (won) {
      state = STATE.WIN;
      const coinsBonus = levelData.reward || CFG.COIN_LEVEL_WIN;
      Storage.addCoins(coinsBonus);
      Storage.unlockLevel(level + 1);
      Audio.sfx.win();

      const stars = score > 1500 ? '⭐⭐⭐' : score > 800 ? '⭐⭐' : '⭐';
      $('win-stars').textContent = stars;
      $('win-score').textContent = score;
      $('win-coins').textContent = `+${coinsBonus} 💰`;
      $('win-level').textContent = level;
      $('win-best').textContent  = Storage.data.highscore;
      const nextBtn = $('btn-next-level');
      nextBtn.disabled = (level >= LEVELS.length);
      nextBtn.textContent = (level >= LEVELS.length) ? '🏆 Champion!' : 'Next Level ▶';
      showOverlay('win');

    } else {
      state = STATE.GAMEOVER;
      Audio.sfx.gameOver();
      $('go-score').textContent = score;
      $('go-best').textContent  = Storage.data.highscore;
      showOverlay('gameover');
    }
  }

  // ── Main render loop ──────────────────────────────────────
  function gameLoop(ts) {
    animId = requestAnimationFrame(gameLoop);
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    if (state !== STATE.GAME) return;

    updateFlying(dt);
    updateFalling(dt);
    updateParticles(dt);
    updateScorePopups(dt);
    updateFreeze(dt);

    render();
  }

  // ── Rendering ─────────────────────────────────────────────
  function render() {
    ctx.clearRect(0, 0, canvasW, canvasH);

    drawBackground();
    drawDangerLine();
    drawGrid();
    drawFallingBubbles();
    drawParticles();
    drawScorePopups();
    drawFlying();
    drawAimLine();
    drawShooter();
  }

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasW; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasH); ctx.stroke();
    }
    for (let y = 0; y < canvasH; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke();
    }
  }

  function drawDangerLine() {
    const dy = dangerY + R;
    ctx.save();
    ctx.strokeStyle = 'rgba(239,68,68,0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(0, dy); ctx.lineTo(canvasW, dy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawGrid() {
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      const cols = colsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bub = grid[r][c];
        if (!bub) continue;
        const gx = colX(r, c);
        const gy = rowY(r);
        drawSingleBubble(ctx, gx, gy, R, bub);
      }
    }
  }

  function drawSingleBubble(context, x, y, radius, bub) {
    const color = bub.color >= 0 ? COLORS[bub.color] : '#ffffff';

    // Glow
    context.save();
    context.shadowColor = color;
    context.shadowBlur  = 8;

    // Base circle
    const grad = context.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
    grad.addColorStop(0, lighten(color, 0.5));
    grad.addColorStop(0.6, color);
    grad.addColorStop(1, darken(color, 0.4));

    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = grad;
    context.fill();
    context.restore();

    // Outline
    context.strokeStyle = 'rgba(255,255,255,0.25)';
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.stroke();

    // Shine spot
    context.beginPath();
    context.arc(x - radius * 0.28, y - radius * 0.28, radius * 0.22, 0, Math.PI * 2);
    context.fillStyle = 'rgba(255,255,255,0.45)';
    context.fill();

    // Special icon
    if (bub.special === SPECIAL.BOMB) {
      context.font = `${radius * 0.9}px serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('💣', x, y + 1);
    } else if (bub.special === SPECIAL.RAINBOW) {
      context.font = `${radius * 0.9}px serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🌈', x, y + 1);
    }
  }

  function drawFlying() {
    if (!flying) return;
    drawSingleBubble(ctx, flying.x, flying.y, R, flying.bub);
  }

  function drawAimLine() {
    if (pointerDown || true) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth   = 2;
      ctx.setLineDash([6, 8]);

      let x = shooterX, y = shooterY;
      let vx = Math.cos(shooterAngle) * 8;
      let vy = Math.sin(shooterAngle) * 8;

      // Only draw aim line when not shooting downwards
      if (vy >= 0) { ctx.restore(); return; }

      ctx.beginPath();
      ctx.moveTo(x, y);

      for (let i = 0; i < 120; i++) {
        x += vx; y += vy;
        if (x - R < 0)        { vx =  Math.abs(vx); x = R; }
        if (x + R > canvasW)  { vx = -Math.abs(vx); x = canvasW - R; }
        if (y < 0)  break;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  function drawShooter() {
    // Launcher base
    ctx.save();
    const grd = ctx.createRadialGradient(shooterX, shooterY, 0, shooterX, shooterY, R * 1.4);
    grd.addColorStop(0, 'rgba(124,58,237,0.4)');
    grd.addColorStop(1, 'rgba(124,58,237,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(shooterX, shooterY, R * 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Current bubble
    if (currentBubble && !flying) {
      drawSingleBubble(ctx, shooterX, shooterY, R, currentBubble);
    }

    // Cannon barrel
    ctx.save();
    ctx.translate(shooterX, shooterY);
    ctx.rotate(shooterAngle + Math.PI / 2);
    const barrelGrad = ctx.createLinearGradient(-5, 0, 5, 0);
    barrelGrad.addColorStop(0, '#4c1d95');
    barrelGrad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = barrelGrad;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-5, -R * 1.7, 10, R * 1.4, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawFallingBubbles() {
    fallingBubbles.forEach(f => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, f.alpha);
      ctx.translate(f.x, f.y);
      ctx.scale(f.scale, f.scale);
      const grad = ctx.createRadialGradient(-R * 0.3, -R * 0.3, 0, 0, 0, R);
      grad.addColorStop(0, lighten(f.color, 0.4));
      grad.addColorStop(1, f.color);
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });
  }

  function drawParticles() {
    popParticles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawScorePopups() {
    scorePopups.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.font        = 'bold 13px "Segoe UI", sans-serif';
      ctx.fillStyle   = '#f59e0b';
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur  = 4;
      ctx.fillText(p.val, p.x, p.y);
      ctx.restore();
    });
  }

  // ── Colour helpers ────────────────────────────────────────
  function lighten(hex, amt) {
    const c = hexToRgb(hex);
    return `rgb(${Math.min(255,c.r+amt*255)},${Math.min(255,c.g+amt*255)},${Math.min(255,c.b+amt*255)})`;
  }

  function darken(hex, amt) {
    const c = hexToRgb(hex);
    return `rgb(${Math.max(0,c.r-amt*255)},${Math.max(0,c.g-amt*255)},${Math.max(0,c.b-amt*255)})`;
  }

  function hexToRgb(hex) {
    const h = hex.replace('#','');
    return {
      r: parseInt(h.slice(0,2),16),
      g: parseInt(h.slice(2,4),16),
      b: parseInt(h.slice(4,6),16),
    };
  }

  // ── Input handling ────────────────────────────────────────
  function getCanvasPos(e) {
    const rect  = canvas.getBoundingClientRect();
    const scaleX = canvasW  / rect.width;
    const scaleY = canvasH / rect.height;
    const src   = e.changedTouches ? e.changedTouches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }

  function updateAim(e) {
    if (state !== STATE.GAME) return;
    const { x, y } = getCanvasPos(e);
    aimX = x; aimY = y;
    const dx = x - shooterX;
    const dy = y - shooterY;
    shooterAngle = Math.atan2(dy, dx);
    // Clamp to upper half
    if (shooterAngle > -0.1) shooterAngle = -0.1;
    if (shooterAngle < -Math.PI + 0.1) shooterAngle = -Math.PI + 0.1;
  }

  function handleShoot(e) {
    Audio.resumeCtx();
    updateAim(e);
    shoot();
  }

  function bindEvents() {
    // Canvas: aim + shoot
    canvas.addEventListener('mousemove', e => { pointerDown = true; updateAim(e); });
    canvas.addEventListener('mouseup',   e => handleShoot(e));
    canvas.addEventListener('touchmove', e => { e.preventDefault(); updateAim(e); }, { passive: false });
    canvas.addEventListener('touchend',  e => { e.preventDefault(); handleShoot(e); }, { passive: false });

    // Pause
    $('btn-pause').addEventListener('click', () => {
      if (state !== STATE.GAME) return;
      Audio.sfx.click();
      state = STATE.PAUSE;
      $('pause-score').textContent = score;
      showOverlay('pause');
    });

    $('btn-resume').addEventListener('click', () => {
      Audio.sfx.click();
      hideOverlay('pause');
      state = STATE.GAME;
    });

    $('btn-restart').addEventListener('click', () => {
      Audio.sfx.click();
      hideOverlay('pause');
      startLevel(level);
    });

    $('btn-quit').addEventListener('click', () => {
      Audio.sfx.click();
      hideOverlay('pause');
      state = STATE.MENU;
      updateMenuStats();
      showScreen('menu');
    });

    // Win
    $('btn-next-level').addEventListener('click', () => {
      Audio.sfx.click();
      hideOverlay('win');
      if (level < LEVELS.length) startLevel(level + 1);
      else { state = STATE.MENU; updateMenuStats(); showScreen('menu'); }
    });

    $('btn-win-menu').addEventListener('click', () => {
      Audio.sfx.click();
      hideOverlay('win');
      state = STATE.MENU;
      updateMenuStats();
      showScreen('menu');
    });

    // Game over
    $('btn-try-again').addEventListener('click', () => {
      Audio.sfx.click();
      hideOverlay('gameover');
      startLevel(level);
    });

    $('btn-go-menu').addEventListener('click', () => {
      Audio.sfx.click();
      hideOverlay('gameover');
      state = STATE.MENU;
      updateMenuStats();
      showScreen('menu');
    });

    // Menu
    $('btn-play').addEventListener('click', () => {
      Audio.sfx.click();
      Audio.resumeCtx();
      const lvl = Math.min(Storage.data.level || 1, LEVELS.length);
      startLevel(lvl);
    });

    $('btn-shop').addEventListener('click', () => {
      Audio.sfx.click();
      openShop();
    });

    $('btn-sound').addEventListener('click', () => {
      Audio.sfx.click();
      const on = !Storage.data.soundOn;
      Storage.setSoundOn(on);
      Audio.setEnabled(on);
      $('btn-sound').textContent = on ? '🔊' : '🔇';
    });

    $('btn-leaderboard').addEventListener('click', () => {
      Audio.sfx.click();
      openLeaderboard();
    });

    $('btn-how-to-play').addEventListener('click', () => {
      Audio.sfx.click();
      showOverlay('howto');
    });

    $('howto-close').addEventListener('click', () => { Audio.sfx.click(); hideOverlay('howto'); });
    $('howto-ok').addEventListener('click',    () => { Audio.sfx.click(); hideOverlay('howto'); });

    // Shop back
    $('shop-back').addEventListener('click', () => {
      Audio.sfx.click();
      state = STATE.MENU;
      updateMenuStats();
      showScreen('menu');
    });

    // Shop buy
    document.querySelectorAll('.btn-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.dataset.item;
        const cost = parseInt(btn.dataset.cost, 10);
        if (Storage.spendCoins(cost)) {
          Storage.addItem(item, 1);
          Audio.sfx.coin();
          Audio.sfx.levelUp();
          refreshShopUI();
        } else {
          btn.textContent = '❌ Not enough!';
          setTimeout(() => {
            btn.textContent = `Buy · ${cost} 💰`;
          }, 1200);
        }
      });
    });

    // Power-ups during game
    $('btn-use-bomb').addEventListener('click', () => {
      if (Storage.getInventory().bomb <= 0) return;
      Audio.sfx.click();
      togglePowerup('bomb');
    });

    $('btn-use-rainbow').addEventListener('click', () => {
      if (Storage.getInventory().rainbow <= 0) return;
      Audio.sfx.click();
      togglePowerup('rainbow');
    });

    $('btn-use-freeze').addEventListener('click', () => {
      if (Storage.getInventory().freeze <= 0) return;
      activateFreeze();
    });

    $('btn-use-life').addEventListener('click', () => {
      if (!Storage.useItem('life')) return;
      Audio.sfx.powerup();
      if (lives < CFG.MAX_LIVES) {
        lives++;
        updateHUD();
      }
      updatePowerupBar();
    });

    // Leaderboard
    $('lb-close').addEventListener('click', () => { Audio.sfx.click(); hideOverlay('leaderboard'); });
    $('lb-clear').addEventListener('click', () => {
      Audio.sfx.click();
      Storage.clearTopScores();
      renderLeaderboard();
    });

    // Resize
    window.addEventListener('resize', resizeCanvas);
  }

  function togglePowerup(name) {
    if (activePowerup === name) {
      clearPowerupSelection();
    } else {
      activePowerup = name;
      document.querySelectorAll('.btn-powerup').forEach(b => b.classList.remove('active'));
      $('btn-use-' + name).classList.add('active');
    }
  }

  // ── Shop ──────────────────────────────────────────────────
  function openShop() {
    state = STATE.SHOP;
    refreshShopUI();
    showScreen('shop');
  }

  function refreshShopUI() {
    const inv = Storage.getInventory();
    $('shop-coins').textContent  = Storage.data.coins;
    $('bomb-count').textContent    = inv.bomb;
    $('rainbow-count').textContent = inv.rainbow;
    $('life-count').textContent    = inv.life;
    $('freeze-count').textContent  = inv.freeze;
  }

  // ── Leaderboard ───────────────────────────────────────────
  function openLeaderboard() {
    renderLeaderboard();
    showOverlay('leaderboard');
  }

  function renderLeaderboard() {
    const list  = $('leaderboard-list');
    const scores = Storage.data.topScores || [];
    list.innerHTML = '';
    if (scores.length === 0) {
      list.innerHTML = '<p class="lb-empty">No scores yet. Play a game!</p>';
      return;
    }
    scores.forEach((entry, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-score">${entry.score.toLocaleString()}</span>
        <span class="lb-date">${entry.date}</span>
      `;
      list.appendChild(li);
    });
  }

  // ── Initialise ────────────────────────────────────────────
  function init() {
    resizeCanvas();
    bindEvents();

    // Sound button initial state
    const soundOn = Storage.data.soundOn !== false;
    $('btn-sound').textContent = soundOn ? '🔊' : '🔇';
    Audio.setEnabled(soundOn);

    // Start game loop (renders even on menu for smooth transitions)
    animId = requestAnimationFrame(ts => {
      lastTime = ts;
      (function loop(ts) {
        animId = requestAnimationFrame(loop);
        const dt = Math.min((ts - lastTime) / 1000, 0.05);
        lastTime = ts;
        if (state === STATE.GAME) {
          updateFlying(dt);
          updateFalling(dt);
          updateParticles(dt);
          updateScorePopups(dt);
          updateFreeze(dt);
          render();
        }
      })(ts);
    });

    // Loading sequence
    doLoading();
  }

  return { init };
})();

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => Game.init());
