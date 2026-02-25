const FACE_MAP = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

function createPipGrid() {
  const grid = document.createElement("div");
  grid.className = "dice-pips";
  for (let i = 0; i < 9; i += 1) {
    const pip = document.createElement("div");
    pip.className = "pip";
    grid.appendChild(pip);
  }
  return grid;
}

function setFace(dieEl, face) {
  const pips = dieEl.querySelectorAll(".pip");
  const active = new Set(FACE_MAP[face] || FACE_MAP[1]);
  pips.forEach((pip, index) => {
    pip.style.opacity = active.has(index) ? "1" : "0";
  });
}

export function createUI({ mount, config, onRollClick, onSoundToggle }) {
  mount.innerHTML = "";
  mount.classList.add("dice-plugin-root");

  const container = document.createElement("div");
  container.className = "dice-plugin";
  container.dataset.theme = config.theme;

  const topBar = document.createElement("div");
  topBar.className = "top-bar";
  topBar.innerHTML = '<h1 class="title">Random Dice Assignment</h1>';

  const soundButton = document.createElement("button");
  soundButton.type = "button";
  soundButton.className = "sound-btn";
  soundButton.textContent = config.soundEnabled ? "Sound: On" : "Sound: Off";
  soundButton.addEventListener("click", () => {
    const next = soundButton.textContent.endsWith("Off");
    soundButton.textContent = next ? "Sound: On" : "Sound: Off";
    onSoundToggle(next);
  });
  topBar.appendChild(soundButton);

  const stage = document.createElement("div");
  stage.className = "stage";

  const die = document.createElement("div");
  die.className = "die";
  die.appendChild(createPipGrid());
  setFace(die, 1);

  stage.appendChild(die);

  const bottom = document.createElement("div");
  bottom.className = "actions";

  const rollBtn = document.createElement("button");
  rollBtn.type = "button";
  rollBtn.className = "roll-btn";
  rollBtn.textContent = "Roll Dice";
  rollBtn.addEventListener("click", onRollClick);

  const result = document.createElement("div");
  result.className = "result";
  result.textContent = "Result: -";

  const timestamp = document.createElement("div");
  timestamp.className = "timestamp";
  timestamp.textContent = "";
  if (!config.showTimestamp) {
    timestamp.style.display = "none";
  }

  bottom.append(rollBtn, result, timestamp);
  container.append(topBar, stage, bottom);
  mount.appendChild(container);

  return {
    die,
    rollBtn,
    result,
    timestamp,
    setFace: (face) => setFace(die, face),
    setResult: (value) => {
      result.textContent = value == null ? "Result: -" : `Result: ${value}`;
    },
    setTimestamp: (value) => {
      timestamp.textContent = value ? `Rolled at: ${value}` : "";
    },
    setRollDisabled: (disabled) => {
      rollBtn.disabled = disabled;
    },
    setRollLabel: (label) => {
      rollBtn.textContent = label;
    }
  };
}
