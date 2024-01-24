export let score = 0;
export let level = 1;
export let clearedLines = 0;

export function addClearedLines(value) {
    clearedLines += value;
    console.log(clearedLines);
    level = Math.floor(clearedLines / 2);
    switch (value) {
        case 1:score += level * 100 
        break;
        case 2:score += level * 300
        break;
        case 3:score += level * 500
        break;
        case 4:score += level * 800
        break;

    }
}

export function addScore(value) {
    score += value;
}

export function getLevelTime() {
    let newTime = 500 - level * 50;
    if (newTime < 50) return 50;
    return newTime;
}
