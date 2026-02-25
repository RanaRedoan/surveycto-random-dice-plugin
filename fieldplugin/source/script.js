/* global fieldProperties, setAnswer, getPluginParameter */

var diceTouch = document.getElementById("dice-touch-target");
var cubeEl = document.getElementById("dice-cube");
var faceEls = {
  front: document.querySelector(".cube-front"),
  back: document.querySelector(".cube-back"),
  right: document.querySelector(".cube-right"),
  left: document.querySelector(".cube-left"),
  top: document.querySelector(".cube-top"),
  bottom: document.querySelector(".cube-bottom")
};
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

function randomDistinctFace(excludeA, excludeB) {
  var val = randomFace();
  while (val === excludeA || val === excludeB) {
    val = randomFace();
  }
  return val;
}

function getCubeLayout(front) {
  var top = randomDistinctFace(front, 7 - front);
  var right = randomDistinctFace(front, 7 - front);
  if (right === top || right === (7 - top)) {
    right = randomDistinctFace(front, top);
  }
  return {
    front: front,
    back: 7 - front,
    right: right,
    left: 7 - right,
    top: top,
    bottom: 7 - top
  };
}

function orientationForFront(front) {
  var map = {
    1: "translate(-50%, -50%) rotateX(-16deg) rotateY(22deg)",
    2: "translate(-50%, -50%) rotateX(-18deg) rotateY(112deg)",
    3: "translate(-50%, -50%) rotateX(-18deg) rotateY(202deg)",
    4: "translate(-50%, -50%) rotateX(-18deg) rotateY(292deg)",
    5: "translate(-50%, -50%) rotateX(76deg) rotateY(22deg)",
    6: "translate(-50%, -50%) rotateX(-104deg) rotateY(22deg)"
  };
  return map[front] || map[1];
}

function setFace(frontValue) {
  var layout = getCubeLayout(frontValue);
  renderDots(faceEls.front, layout.front);
  renderDots(faceEls.back, layout.back);
  renderDots(faceEls.right, layout.right);
  renderDots(faceEls.left, layout.left);
  renderDots(faceEls.top, layout.top);
  renderDots(faceEls.bottom, layout.bottom);
  return orientationForFront(frontValue);
}

function applyTransform(transformValue) {
  cubeEl.style.transform = transformValue;
}

function animateSettle(targetTransform, onComplete) {
  var settleDuration = Math.max(700, Math.round(config.animationDurationMs * 0.44));

  if (typeof cubeEl.animate !== "function") {
    applyTransform(targetTransform);
    onComplete();
    return;
  }

  var animation = cubeEl.animate(
    [
      { transform: targetTransform + " translateY(-14px) scale(1.07) rotateZ(8deg)", offset: 0 },
      { transform: targetTransform + " translateY(11px) scale(0.94) rotateZ(-6deg)", offset: 0.34 },
      { transform: targetTransform + " translateY(-6px) scale(1.03) rotateZ(3deg)", offset: 0.62 },
      { transform: targetTransform + " translateY(3px) scale(0.99) rotateZ(-1deg)", offset: 0.82 },
      { transform: targetTransform + " translateY(0px) scale(1) rotateZ(0deg)", offset: 1 }
    ],
    {
      duration: settleDuration,
      easing: "cubic-bezier(0.16, 0.84, 0.22, 1)",
      fill: "forwards"
    }
  );

  animation.onfinish = function () {
    applyTransform(targetTransform);
    onComplete();
  };
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
  var targetTransform = setFace(finalValue);

  setResult(finalValue);
  setTimestampNow();
  setAnswer(String(finalValue));
  playBeep(430, 0.11);

  animateSettle(targetTransform, function () {
    if (!config.allowReroll) {
      locked = true;
      rollButton.textContent = "Result Locked";
      setControlsDisabled(true);
    } else {
      rollButton.textContent = "Re-roll Dice";
      setControlsDisabled(false);
    }
  });
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
    applyTransform(setFace(randomFace()));
  }, 70);

  rollTimer = setTimeout(function () {
    clearInterval(previewTimer);
    previewTimer = null;
    finishRoll(randomFace());
  }, config.animationDurationMs);
}

function applyExistingAnswer() {
  var current = fieldProperties.CURRENT_ANSWER;
  if (current === undefined || current === null || current === "") {
    applyTransform(setFace(1));
    resultText.textContent = "Result: -";
    timestampText.textContent = "";
    locked = false;
    return;
  }

  var value = Number(current);
  if (!Number.isFinite(value) || value < 1 || value > 6) {
    applyTransform(setFace(1));
    resultText.textContent = "Result: -";
    timestampText.textContent = "";
    locked = false;
    return;
  }

  applyTransform(setFace(Math.round(value)));
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
  setAnswer("");
  applyTransform(setFace(1));
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
