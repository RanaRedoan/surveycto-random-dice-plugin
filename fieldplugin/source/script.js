/* global fieldProperties, setAnswer, getPluginParameter */

var diceEl = document.getElementById("dice-touch-target");
var rollButton = document.getElementById("roll-button");
var soundButton = document.getElementById("sound-button");
var resultText = document.getElementById("result-text");
var timestampText = document.getElementById("timestamp-text");

var rolling = false;
var locked = false;
var soundEnabled = false;
var rollTimer = null;
var previewTimer = null;

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  var normalized = String(value).toLowerCase().trim();
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return fallback;
}

function parseNumber(value, fallback, min, max) {
  var num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  if (num < min) return min;
  if (num > max) return max;
  return Math.round(num);
}

function getConfig() {
  return {
    allowReroll: parseBoolean(getPluginParameter("allow-reroll"), false),
    soundEnabled: parseBoolean(getPluginParameter("sound-enabled"), false),
    showTimestamp: parseBoolean(getPluginParameter("show-timestamp"), true),
    animationDurationMs: parseNumber(getPluginParameter("animation-duration-ms"), 2200, 800, 4000)
  };
}

var config = getConfig();
soundEnabled = config.soundEnabled;

function updateSoundLabel() {
  soundButton.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
}

function randomFace() {
  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    var arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return (arr[0] % 6) + 1;
  }
  return Math.floor(Math.random() * 6) + 1;
}

function setFace(face) {
  var keepRolling = rolling ? " rolling" : "";
  diceEl.className = "dice-face face-" + String(face) + keepRolling;
}

function setResult(face) {
  resultText.textContent = "Result: " + String(face);
}

function setTimestampNow() {
  if (!config.showTimestamp) {
    timestampText.textContent = "";
    return;
  }
  var now = new Date().toISOString();
  timestampText.textContent = "Rolled at: " + now;
}

function setControlsDisabled(disabled) {
  rollButton.disabled = disabled;
  diceEl.disabled = disabled;
}

function playBeep(freq, duration) {
  if (!soundEnabled) return;
  var Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  if (!window.__diceAudioCtx) window.__diceAudioCtx = new Ctx();
  var ctx = window.__diceAudioCtx;
  var now = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.value = 0.0001;
  gain.gain.linearRampToValueAtTime(0.045, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function startRoll() {
  if (fieldProperties.READONLY) return;
  if (rolling) return;
  if (locked && !config.allowReroll) return;

  rolling = true;
  setControlsDisabled(true);
  playBeep(260, 0.12);
  diceEl.className = "dice-face rolling face-" + randomFace();

  previewTimer = setInterval(function () {
    setFace(randomFace());
  }, 100);

  rollTimer = setTimeout(function () {
    clearInterval(previewTimer);
    previewTimer = null;
    var finalValue = randomFace();
    setFace(finalValue);
    diceEl.classList.remove("rolling");
    diceEl.classList.add("settle-flash");
    setTimeout(function () {
      diceEl.classList.remove("settle-flash");
    }, 320);
    setResult(finalValue);
    setTimestampNow();
    setAnswer(String(finalValue));
    playBeep(430, 0.08);
    rolling = false;

    if (!config.allowReroll) {
      locked = true;
      rollButton.textContent = "Result Locked";
      setControlsDisabled(true);
    } else {
      rollButton.textContent = "Re-roll Dice";
      setControlsDisabled(false);
    }
  }, config.animationDurationMs);
}

function applyExistingAnswer() {
  var current = fieldProperties.CURRENT_ANSWER;
  if (current === undefined || current === null || current === "") {
    setFace(1);
    resultText.textContent = "Result: -";
    timestampText.textContent = "";
    locked = false;
    return;
  }

  var value = Number(current);
  if (!Number.isFinite(value) || value < 1 || value > 6) {
    setFace(1);
    resultText.textContent = "Result: -";
    timestampText.textContent = "";
    locked = false;
    return;
  }

  setFace(Math.round(value));
  setResult(Math.round(value));
  if (config.showTimestamp) {
    timestampText.textContent = "Saved value loaded";
  }

  if (!config.allowReroll) {
    locked = true;
    rollButton.textContent = "Result Locked";
    setControlsDisabled(true);
  } else {
    rollButton.textContent = "Re-roll Dice";
  }
}

function initializeUI() {
  updateSoundLabel();

  if (fieldProperties.READONLY) {
    rollButton.style.display = "none";
    soundButton.style.display = "none";
    setControlsDisabled(true);
  }

  rollButton.onclick = function () {
    startRoll();
  };

  diceEl.onclick = function () {
    startRoll();
  };

  soundButton.onclick = function () {
    soundEnabled = !soundEnabled;
    updateSoundLabel();
  };

  applyExistingAnswer();
}

function clearAnswer() {
  if (rollTimer) clearTimeout(rollTimer);
  if (previewTimer) clearInterval(previewTimer);
  rollTimer = null;
  previewTimer = null;
  rolling = false;
  locked = false;
  setAnswer("");
  setFace(1);
  resultText.textContent = "Result: -";
  timestampText.textContent = "";
  rollButton.textContent = "Roll Dice";
  if (!fieldProperties.READONLY) setControlsDisabled(false);
}

function setFocus() {
  if (!fieldProperties.READONLY) {
    rollButton.focus();
  }
}

initializeUI();
