export function secureRandomInt(min, max, cryptoObj = globalThis.crypto) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new Error("Invalid range");
  }

  const span = max - min + 1;

  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const maxUint32 = 0xffffffff;
    const threshold = maxUint32 - (maxUint32 % span);
    const arr = new Uint32Array(1);
    do {
      cryptoObj.getRandomValues(arr);
    } while (arr[0] >= threshold);
    return min + (arr[0] % span);
  }

  return min + Math.floor(Math.random() * span);
}

export function rollDie(cryptoObj = globalThis.crypto) {
  return secureRandomInt(1, 6, cryptoObj);
}
