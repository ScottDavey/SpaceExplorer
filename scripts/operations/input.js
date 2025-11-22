/*****************************************************
**************  INPUT DEFAULT BINDINGS  **************
*****************************************************/

/*
    OTHER BINDING VALUES:
        - GAMEPAD:
            - Y: 3
            - Left Bumper: 4
            - Right Bumper: 5
            - Left Thumbstick (press): 10
            - Right Thumbstick (press): 11
        - KEYBOARD:
            - R: 82
            - F: 70
            - S: 83
*/

const KEY_BINDINGS = {
    CONFIRM: {
        KEYBOARD: { name: 'ENTER', value: 13, path: 'images/icons/KEYBOARD-Enter.png' },
        GAMEPAD: { name: 'A', value: 0, path: 'images/icons/GAMEPAD-A.png' },
    },
    PAUSE: {
        KEYBOARD: { name: 'ESCAPE', value: 27, path: 'images/icons/KEYBOARD-Escape.png' },
        GAMEPAD: { name: 'START', value: 9, path: 'images/icons/GAMEPAD-Start.png' },
    },
    UP: {
        KEYBOARD: { name: 'UP', value: 38, path: 'images/icons/KEYBOARD-Up.png' },
        GAMEPAD: { name: 'UP', value: 12, path: 'images/icons/GAMEPAD-Up.png' },
    },
    DOWN: {
        KEYBOARD: { name: 'DOWN', value: 40, path: 'images/icons/KEYBOARD-Down.png' },
        GAMEPAD: { name: 'DOWN', value: 13, path: 'images/icons/GAMEPAD-Down.png' },
    },
    MOVE_LEFT: {
        KEYBOARD: { name: 'A', value: 65, path: 'images/icons/KEYBOARD-A.png' },
        GAMEPAD: { name: 'LEFT', value: 14, path: 'images/icons/GAMEPAD-Left.png' },
    },
    MOVE_RIGHT: {
        KEYBOARD: { name: 'D', value: 68, path: 'images/icons/KEYBOARD-D.png' },
        GAMEPAD: { name: 'RIGHT', value: 15, path: 'images/icons/GAMEPAD-Right.png' },
    },
    JUMP: {
        KEYBOARD: { name: 'SPACE', value: 32, path: 'images/icons/KEYBOARD-Space.png' },
        GAMEPAD: { name: 'A', value: 0, path: 'images/icons/GAMEPAD-A.png' },
    },
    RANDOM_POSITION: {
        KEYBOARD: { name: 'M', value: 77, path: 'images/icons/KEYBOARD-M.png' },
        GAMEPAD: { name: 'N.A', value: -1, path: '' },
    },
    INTERACT: {
        KEYBOARD: { name: 'F', value: 70, path: 'images/icons/KEYBOARD-F.png' },
        GAMEPAD: { name: 'RIGHT TRIGGER', value: 5, path: 'images/icons/GAMEPAD-Right-Trigger.png' },
    },
    SHOOT: {
        KEYBOARD: { name: 'ENTER', value: 13, path: 'images/icons/KEYBOARD-Enter.png' },
        GAMEPAD: { name: 'X', value: 2, path: 'images/icons/GAMEPAD-X.png' },
    },
    SPECIAL: {
        KEYBOARD: { name: 'SHIFT', value: 16, path: 'images/icons/KEYBOARD-Shift.png' },
        GAMEPAD: { name: 'B', value: 1, path: 'images/icons/GAMEPAD-B.png' },
    },
    DEBUG: {
        KEYBOARD: { name: 'CONTROL', value: 17, path: 'images/icons/KEYBOARD-Control.png' },
        GAMEPAD: { name: 'BACK', value: 8, path: 'images/icons/GAMEPAD-Back.png' },
    },
    FADE: {
        KEYBOARD: { name: 'H', value: 72, path: '' },
        GAMEPAD: { name: 'N/A', value: 1, path: '' },
    },
    NEXTLEVEL: {
        KEYBOARD: { name: 'N', value: 78, path: '' },
        GAMEPAD: { name: 'N/A', value: 1, path: '' },
    },
    RESETELAPSED: {
        KEYBOARD: { name: 'R', value: 82, path: '' },
        GAMEPAD: { name: 'N/A', value: 1, path: '' },
    }
};

const INPUT_TYPE = {
    KEYBOARD: 'KEYBOARD',
    GAMEPAD: 'GAMEPAD'
};

/******************************************
**************  INPUT CLASS  **************
******************************************/
class Input {

    constructor() {
        this.inputType = INPUT_TYPE.KEYBOARD;
        this.inputs = {};
        this.mousePosition = new Vector2(0, 0);
        this.isMouseDown = false;
        this.isLeftClickPressed = false;
        this.gamePad = undefined;
        this.hasGamePad = false;
        this.isLocked = false;

        this.GamePadInit();
    }

    GamePadInit() {
        this.gamePad = navigator.getGamepads()[0];

        if (this.gamePad) {
            this.inputType = INPUT_TYPE.GAMEPAD;
            this.hasGamePad = true;
        }
    }

    GamePadDeInit() {
        this.inputType = INPUT_TYPE.KEYBOARD;
        this.gamePad = undefined;
        this.hasGamePad = false;
    }

    GetInputType() {
        return this.inputType;
    }

    IsLocked() {
        return this.isLocked;
    }

    GetInput(binding) {
        return this.inputs[binding[this.inputType].name];
    }

    GetMousePosition() {
        return this.mousePosition;
    }

    IsMouseDown() {
        return this.isMouseDown;
    }

    SetLocked(isLocked) {
        this.isLocked = isLocked;
    }

    ClearInputs() {
        this.inputs = {};
    }

    OnInputEvent(e, type) {

        DEBUG.Update('KEYCODE', `Key Code: ${e.keyCode}`);

        if (this.isLocked) {
            this.ClearInputs();
            return;
        }
        
        // Keys and gamepad buttons are handled the same way by adding the "pressed"
        //  value to an object and indicating if it's true or false
        if (type === 'keydown' || type === 'keyup' || type === 'gamepadbuttondown') {
            const code = e.keyCode;

            for (const binding in KEY_BINDINGS) {

                const bindingByType = KEY_BINDINGS[binding][this.inputType];
                if (code === bindingByType.value) {
                    // If we're pressing the key, set to true. Otherwise, false
                    this.inputs[bindingByType.name] = (type === 'keydown' || type === 'gamepadbuttondown') ? 1.0 : 0;
                    break;
                }

            }

        }
        
        if (type === 'gamepadthumbstickhorizontal') {
            const thumbstickDirection = +e.value > 0 ? 'MOVE_RIGHT' : 'MOVE_LEFT';
            
            this.inputs[KEY_BINDINGS[thumbstickDirection].GAMEPAD.name] = Math.abs(e.value);
        }

        if (type === 'mousemove') {
            this.mousePosition = new Vector2(e.offsetX, e.offsetY);
        }
        
        if (type === 'mousedown') {
            this.isMouseDown = true;
        } else if (type === 'mouseup') {
            this.isMouseDown = false;
        }

        // Based on what event is fired, switch what input we're using
        if (type === 'keydown' || type === 'mousemove' || type === 'mousedown') {
            if (this.inputType !== INPUT_TYPE.KEYBOARD) {
                this.SwitchInputType(INPUT_TYPE.KEYBOARD);
            }
        } else if (type === 'gamepadbuttondown' || type === 'gamepadthumbstickhorizontal' || type === 'gamepadthumbstickvertical') {
            if (this.inputType !== INPUT_TYPE.GAMEPAD) {
                this.SwitchInputType(INPUT_TYPE.GAMEPAD);
            }
        }

    }

    SwitchInputType(inputType = INPUT_TYPE.KEYBOARD) {
        this.inputType = inputType;
        this.ClearInputs();   // Clear input list so we don't have cross over
    }

    Update() {

        // TRIGGER GAMEPAD EVENTS
        if (this.hasGamePad) {

            // Re-retrieve our gamepad
            this.gamePad = navigator.getGamepads()[0];

            // Manually clear inputs before checking again. This is because we can only detect when a button is down
            //  so we can't clear the button press for a button up event.
            if (this.inputType === INPUT_TYPE.GAMEPAD) {
                this.ClearInputs();
            }
            
            // Loop over game pad buttons to see if any are pressed
            for (let i = 0; i < this.gamePad.buttons.length; i++) {
                const button = this.gamePad.buttons[i];
                
                if (button.pressed) {
                    this.OnInputEvent({ keyCode: i, value: button.value }, 'gamepadbuttondown');
                }

            }

            // Axes (thumbsticks). 2 axes per thumbstick (vertical and horizontal)
            const leftThumbstickHorizontal = +this.gamePad.axes[0].toFixed(2);
            const leftThumbstickVertical = +this.gamePad.axes[1].toFixed(2);

            if (Math.abs(leftThumbstickHorizontal) > 0.05) {
                this.OnInputEvent({ keyCode: 0, value: leftThumbstickHorizontal }, 'gamepadthumbstickhorizontal');
            }
            
            if (Math.abs(leftThumbstickVertical) > 0.05) {
                this.OnInputEvent({ keyCode: 1, value: leftThumbstickVertical }, 'gamepadthumbstickvertical');
            }

        }

        DEBUG.Update('INPUT', `Input Type: ${Object.keys(INPUT_TYPE).find(key => INPUT_TYPE[key] === this.inputType)}`);
    }

}