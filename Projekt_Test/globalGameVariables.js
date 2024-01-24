

export let level = 0;
export let clearedLines = 0;

export function addClearedLines(value) {
    clearedLines += value;
    console.log(clearedLines);
    level = Math.floor(clearedLines/2);
}

export function getLevelTime() {
    let newTime = 500 - level * 50;
    if (newTime < 50) return 50;
    return newTime;
}
