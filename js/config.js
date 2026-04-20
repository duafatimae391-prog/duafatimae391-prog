/* ═══════════════════════════════════════════════════════════
   config.js — Game constants, colours & level definitions
   ═══════════════════════════════════════════════════════════ */

'use strict';

const CFG = Object.freeze({
  // Canvas & grid
  CANVAS_W:    480,
  CANVAS_H:    600,
  BUBBLE_R:    21,          // bubble radius (px)
  COLS_ODD:    11,          // bubbles in odd  rows (0-indexed even)
  COLS_EVEN:   10,          // bubbles in even rows (0-indexed odd)
  GRID_TOP_Y:  8,           // y of first row centre (px inside canvas)
  DANGER_ROW:  11,          // if any bubble occupies this row → lose life

  // Physics
  BUBBLE_SPEED:    800,     // px/s
  SHOOTER_Y_RATIO: 0.88,    // shooter centre as fraction of canvas height

  // Scoring
  POP_SCORE:    10,
  DROP_SCORE:   5,          // per fallen bubble

  // Coins
  COIN_PER_POP:   1,
  COIN_LEVEL_WIN: 30,

  // Lives
  MAX_LIVES: 3,

  // Auto-descend: every N shots add a new row
  SHOTS_PER_DESCENT: 8,

  // Minimum bubbles to match (pop)
  MATCH_MIN: 3,
});

// ── Bubble colours ──────────────────────────────────────────
const COLORS = [
  '#FF4757',  // 0 red
  '#FFA502',  // 1 orange
  '#2ED573',  // 2 green
  '#1E90FF',  // 3 blue
  '#C44CE9',  // 4 purple
  '#FF6FA3',  // 5 pink
];

const COLOR_COUNT = COLORS.length;

// Specials
const SPECIAL = Object.freeze({
  NONE:    -1,
  BOMB:    'bomb',
  RAINBOW: 'rainbow',
  EMPTY:   null,
});

// ── Levels ──────────────────────────────────────────────────
// Each level defines:
//   rows    : starting grid rows (array of arrays; null = empty cell)
//   colors  : which colour indices can appear
//   moves   : max shots before forced descent happens faster
//   reward  : coin bonus on level clear
//
// Encoding: integer 0-5 → colour index, null → empty cell
//
// Rows are top-to-bottom.  Odd-indexed rows (0-based) are offset by R.
// Row length alternates COLS_ODD / COLS_EVEN.

const LEVELS = [
  // ── Level 1 ── 4 colours, 4 rows, simple
  {
    colors: [0,1,2,3],
    moves: 25, reward: 50,
    rows: [
      [0,1,2,3,0,1,2,3,0,1,2],
      [1,2,3,0,1,2,3,0,1,2],
      [2,3,0,1,2,3,0,1,2,3,2],
      [3,0,1,2,3,0,1,2,3,0],
    ],
  },

  // ── Level 2 ── 4 colours, 5 rows, stripes
  {
    colors: [0,1,2,3],
    moves: 25, reward: 60,
    rows: [
      [0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1],
      [2,2,2,2,2,2,2,2,2,2,2],
      [3,3,3,3,3,3,3,3,3,3],
      [0,0,0,0,0,0,0,0,0,0,0],
    ],
  },

  // ── Level 3 ── 5 colours, 5 rows
  {
    colors: [0,1,2,3,4],
    moves: 28, reward: 70,
    rows: [
      [0,1,0,1,0,1,0,1,0,1,0],
      [2,3,2,3,2,3,2,3,2,3],
      [4,0,4,0,4,0,4,0,4,0,4],
      [1,2,1,2,1,2,1,2,1,2],
      [3,4,3,4,3,4,3,4,3,4,3],
    ],
  },

  // ── Level 4 ── pyramid shape
  {
    colors: [0,1,2,3],
    moves: 30, reward: 80,
    rows: [
      [0,1,2,3,0,1,2,3,0,1,2],
      [null,1,2,3,0,1,2,3,null,null],
      [null,null,2,3,0,1,2,null,null,null,null],
      [null,null,null,3,0,1,null,null,null,null],
      [null,null,null,null,0,null,null,null,null,null,null],
    ],
  },

  // ── Level 5 ── 5 colours, denser
  {
    colors: [0,1,2,3,4],
    moves: 30, reward: 90,
    rows: [
      [0,4,1,4,2,4,3,4,0,4,1],
      [4,0,4,1,4,2,4,3,4,0],
      [1,4,2,4,3,4,0,4,1,4,2],
      [4,1,4,2,4,3,4,0,4,1],
      [2,4,3,4,0,4,1,4,2,4,3],
      [4,2,4,3,4,0,4,1,4,2],
    ],
  },

  // ── Level 6 ── checkerboard 6 colours
  {
    colors: [0,1,2,3,4,5],
    moves: 32, reward: 100,
    rows: [
      [0,1,2,3,4,5,0,1,2,3,4],
      [5,0,1,2,3,4,5,0,1,2],
      [4,5,0,1,2,3,4,5,0,1,2],
      [3,4,5,0,1,2,3,4,5,0],
      [2,3,4,5,0,1,2,3,4,5,2],
    ],
  },

  // ── Level 7 ── diamond
  {
    colors: [0,1,2,3,4],
    moves: 35, reward: 120,
    rows: [
      [null,null,null,null,null,0,null,null,null,null,null],
      [null,null,null,null,1,1,1,null,null,null],
      [null,null,null,2,2,2,2,2,null,null,null],
      [null,null,3,3,3,3,3,3,3,null],
      [null,4,4,4,4,4,4,4,4,4,null],
      [null,null,3,3,3,3,3,3,3,null],
      [null,null,null,2,2,2,2,2,null,null,null],
    ],
  },

  // ── Level 8 ── 6 colours full grid
  {
    colors: [0,1,2,3,4,5],
    moves: 35, reward: 140,
    rows: [
      [0,1,2,3,4,5,0,1,2,3,4],
      [5,4,3,2,1,0,5,4,3,2],
      [0,1,2,3,4,5,0,1,2,3,4],
      [5,4,3,2,1,0,5,4,3,2],
      [0,1,2,3,4,5,0,1,2,3,4],
      [5,4,3,2,1,0,5,4,3,2],
    ],
  },

  // ── Level 9 ── fortress walls
  {
    colors: [0,1,2,3,4,5],
    moves: 38, reward: 160,
    rows: [
      [0,0,0,0,0,0,0,0,0,0,0],
      [0,null,null,null,null,null,null,null,null,null],
      [1,null,2,2,2,2,2,null,null,null,1],
      [1,null,2,null,null,null,2,null,null,null],
      [1,null,2,null,3,null,2,null,null,null,1],
      [1,null,2,null,null,null,2,null,null,null],
      [1,null,2,2,2,2,2,null,null,null,1],
    ],
  },

  // ── Level 10 ── boss level, full board 7 rows 6 colours
  {
    colors: [0,1,2,3,4,5],
    moves: 40, reward: 200,
    rows: [
      [5,0,5,0,5,0,5,0,5,0,5],
      [0,5,0,5,0,5,0,5,0,5],
      [1,2,3,4,5,0,1,2,3,4,1],
      [4,3,2,1,0,5,4,3,2,1],
      [2,4,1,3,0,5,2,4,1,3,2],
      [3,1,4,2,5,0,3,1,4,2],
      [5,5,5,5,5,5,5,5,5,5,5],
    ],
  },
];
