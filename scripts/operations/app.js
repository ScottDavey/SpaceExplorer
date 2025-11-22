// GLOBAL VARIABLES
const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 1500;

const GAME = new Game();
const INPUT = new Input();
const DEBUG = new Debug();
const SOUND_MANAGER = new SoundManager();

let FPS = new FPSClass();
let IS_RUNNING = true;
let CANVAS = undefined;
let CONTEXT = undefined;

function main() {
    // Set up canvas and viewport dimensions
    CANVAS = document.getElementById('viewport');
    CANVAS.width = CANVAS_WIDTH;
    CANVAS.height = CANVAS_HEIGHT;
    CONTEXT = CANVAS.getContext('2d');

    const WRAPPER_DIV = document.getElementById('wrapper');
    WRAPPER_DIV.style.width = `${CANVAS_WIDTH + 4}px`;

    // Event Listeners (Keyboad / Mouse / Gamepad )
    window.addEventListener('keyup', e => { INPUT.OnInputEvent(e, 'keyup'); }, false);
    window.addEventListener('keydown', e => { INPUT.OnInputEvent(e, 'keydown'); }, false);
    CANVAS.addEventListener('mousemove', e => { INPUT.OnInputEvent(e, 'mousemove'); }, false);
    CANVAS.addEventListener('mousedown', e => { INPUT.OnInputEvent(e, 'mousedown'); }, false);
    CANVAS.addEventListener('mouseup', e => { INPUT.OnInputEvent(e, 'mouseup'); }, false);

    window.addEventListener('gamepadconnected', e => { INPUT.GamePadInit(); }, false);
    window.addEventListener('gamepaddisconnected', e => { INPUT.GamePadDeInit(); }, false);

    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', () => {
        document.getElementById('startOverlay').remove();
        onStart();
    }, false);
}

function onStart () {
    GAME.Initialize();
    run();
}

function run() {
    FPS.Update();

    if (IS_RUNNING) {
        GAME.Update();
        GAME.Draw();
    }
    requestAnimationFrame(run);
}