/* ═══════════════════════════════════════════════════════════
   storage.js — Persist game state in localStorage
   ═══════════════════════════════════════════════════════════ */

'use strict';

const Storage = (() => {
  const KEY = 'bubblePopBlast_v1';

  const defaults = () => ({
    coins:      0,
    level:      1,               // highest level reached
    highscore:  0,
    topScores:  [],              // [{score, date}] max 10 entries
    soundOn:    true,
    inventory: {
      bomb:    0,
      rainbow: 0,
      life:    0,
      freeze:  0,
    },
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      return Object.assign(defaults(), JSON.parse(raw));
    } catch (_) {
      return defaults();
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (_) { /* quota or private-mode – silently ignore */ }
  }

  // ── Public API ──────────────────────────────────────────

  let _data = load();

  return {
    get data() { return _data; },

    reload() { _data = load(); },

    persist() { save(_data); },

    addCoins(n) {
      _data.coins = Math.max(0, (_data.coins || 0) + n);
      save(_data);
    },

    spendCoins(n) {
      if (_data.coins < n) return false;
      _data.coins -= n;
      save(_data);
      return true;
    },

    setHighscore(score) {
      if (score > (_data.highscore || 0)) {
        _data.highscore = score;
        save(_data);
      }
    },

    addTopScore(score) {
      const entry = { score, date: new Date().toLocaleDateString() };
      _data.topScores = _data.topScores || [];
      _data.topScores.push(entry);
      _data.topScores.sort((a, b) => b.score - a.score);
      if (_data.topScores.length > 10) _data.topScores.length = 10;
      save(_data);
    },

    clearTopScores() {
      _data.topScores = [];
      save(_data);
    },

    unlockLevel(lvl) {
      if (lvl > (_data.level || 1)) {
        _data.level = lvl;
        save(_data);
      }
    },

    setSoundOn(val) {
      _data.soundOn = val;
      save(_data);
    },

    addItem(item, qty = 1) {
      _data.inventory = _data.inventory || {};
      _data.inventory[item] = (_data.inventory[item] || 0) + qty;
      save(_data);
    },

    useItem(item) {
      _data.inventory = _data.inventory || {};
      if (!_data.inventory[item]) return false;
      _data.inventory[item]--;
      save(_data);
      return true;
    },

    getInventory() {
      return Object.assign({ bomb: 0, rainbow: 0, life: 0, freeze: 0 }, _data.inventory);
    },
  };
})();
