function nextPreviewFace() {
  return 1 + Math.floor(Math.random() * 6);
}

export function animateDiceRoll({ dieEl, durationMs, onPreviewFace }) {
  const previewIntervalMs = 90;

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      onPreviewFace(nextPreviewFace());
    }, previewIntervalMs);

    if (typeof dieEl.animate === "function") {
      dieEl.animate(
        [
          { transform: "translateY(0px) rotateX(0deg) rotateY(0deg) scale(1)" },
          { transform: "translateY(-18px) rotateX(320deg) rotateY(210deg) scale(1.04)", offset: 0.25 },
          { transform: "translateY(10px) rotateX(560deg) rotateY(470deg) scale(0.98)", offset: 0.65 },
          { transform: "translateY(0px) rotateX(720deg) rotateY(720deg) scale(1)", offset: 1 }
        ],
        {
          duration: durationMs,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          fill: "forwards"
        }
      );
    }

    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, durationMs);
  });
}
