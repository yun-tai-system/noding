let isDev: boolean = false;
export function isDevMode() {
    return isDev;
}
export function setDevMode(mode: boolean) {
    isDev = mode;
}
