/* global fieldProperties, setAnswer, getPluginParameter */

var diceTouch = document.getElementById("dice-touch-target");
var cubeEl = document.getElementById("dice-cube");
var frontFaceEl = document.querySelector(".cube-front");
var rightFaceEl = document.querySelector(".cube-right");
var topFaceEl = document.querySelector(".cube-top");
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

var DOT_MAP = {
  1: ["d-c"],
  2: ["d-tl", "d-br"],
  3: ["d-tl", "d-c", "d-br"],
  4: ["d-tl", "d-tr", "d-bl", "d-br"],
  5: ["d-tl", "d-tr", "d-c", "d-bl", "d-br"],
  6: ["d-tl", "d-tr", "d-ml", "d-mr", "d-bl", "d-br"]
};

var ORIENTATION = {
  1: "rotateX(-18deg) rotateY(20deg)",
  2: "rotateX(-24deg) rotateY(112deg)",
  3: "rotateX(-20deg) rotateY(200deg)",
  4: "rotateX(-20deg) rotateY(292deg)",
  5: "rotateX(68deg) rotateY(22deg)",
  6: "rotateX(-92deg) rotateY(18deg)"
};

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

function renderDots(faceEl, value) {
  faceEl.innerHTML = "";
  var dots = DOT_MAP[value] || DOT_MAP[1];
  for (var i = 0; i < dots.length; i += 1) {
    var dot = document.createElement("span");
    dot.className = "dot " + dots[i];
    faceEl.appendChild(dot);
  }
}

function uniqueFaces(seedFace) {
  var top = randomFace();
  var right = randomFace();
  if (top === seedFace) top = (top % 6) + 1;
  if (right === seedFace || right === top) right = ((right + 1) % 6) + 1;
  return { front: seedFace, top: top, right: right };
}

function setFace(face) {
  var faces = uniqueFaces(face);
  renderDots(frontFaceEl, faces.front);
  renderDots(topFaceEl, faces.top);
  renderDots(rightFaceEl, faces.right);
  cubeEl.style.transform = ORIENTATION[face] || ORIENTATION[1];
}

function setResult(face) {
  resultText.textContent = "Result: " + String(face);
}

function setTimestampNow() {
  if (!config.showTimestamp) {
    timestampText.textContent = "";
    return;
  }
  timestampText.textContent = "Rolled at: " + new Date().toISOString();
}

function setControlsDisabled(disabled) {
  rollButton.disabled = disabled;
  diceTouch.disabled = disabled;
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

function finishRoll(finalValue) {
  rolling = false;
  cubeEl.classList.remove("rolling");
  setFace(finalValue);
  cubeEl.classList.add("settle-flash");
  setTimeout(function () {
    cubeEl.classList.remove("settle-flash");
  }, 360);

  setResult(finalValue);
  setTimestampNow();
  setAnswer(String(finalValue));
  playBeep(430, 0.08);

  if (!config.allowReroll) {
    locked = true;
    rollButton.textContent = "Result Locked";
    setControlsDisabled(true);
  } else {
    rollButton.textContent = "Re-roll Dice";
    setControlsDisabled(false);
  }
}

function startRoll() {
  if (fieldProperties.READONLY) return;
  if (rolling) return;
  if (locked && !config.allowReroll) return;

  rolling = true;
  setControlsDisabled(true);
  playBeep(260, 0.12);
  cubeEl.classList.add("rolling");

  previewTimer = setInterval(function () {
    setFace(randomFace());
  }, 110);

  rollTimer = setTimeout(function () {
    clearInterval(previewTimer);
    previewTimer = null;
    finishRoll(randomFace());
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

  rollButton.onclick = startRoll;
  diceTouch.onclick = startRoll;
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
  cubeEl.classList.remove("rolling");
  cubeEl.classList.remove("settle-flash");
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
